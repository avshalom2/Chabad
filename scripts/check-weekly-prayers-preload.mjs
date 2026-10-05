import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const shellMode = process.argv.includes('--shell');
const outputPrefix = shellMode ? 'shell-' : '';
const profile = await mkdtemp(join(tmpdir(), 'chabad-homepage-'));
const browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
let socket;
const errors = [];
const consoleErrors = [];
try {
  let port;
  for (let attempt = 0; attempt < 120; attempt++) {
    try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  assert.ok(port, 'Headless browser did not start');
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0;
  const pending = new Map();
  socket.onmessage = ({ data }) => {
    const response = JSON.parse(data);
    if (response.method === 'Runtime.exceptionThrown') errors.push(response.params.exceptionDetails.text);
    if (response.method === 'Runtime.consoleAPICalled' && response.params.type === 'error') consoleErrors.push(response.params.args.map(a => a.value || a.description).join(' '));
    if (!response.id) return;
    const task = pending.get(response.id);
    if (!task) return;
    clearTimeout(task.timer);
    pending.delete(response.id);
    if (response.error) task.reject(new Error(JSON.stringify(response.error)));
    else task.resolve(response.result);
  };
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 45000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await call('Page.enable'); await call('Runtime.enable'); await call('Network.enable');
  const prayerRequests=[];
  const prior=socket.onmessage;
  socket.onmessage=event=>{
    const message=JSON.parse(event.data);
    if(message.method==='Network.requestWillBeSent' && ['/api/weekly-prayers','/api/store-hours'].includes(new URL(message.params.request.url).pathname)) prayerRequests.push(message.params.request.url);
    prior(event);
  };
  const label=(await readFile('src/components/WeeklyPrayerBox.js','utf8')).match(/aria-label="([^"]+)"/)[1];
  const storeResponse = await fetch('http://localhost:3000/api/store-hours');
  assert.equal(storeResponse.status, 200);
  const storeData = await storeResponse.json();
  const storeTitle = storeData.storeHours.title || (await readFile('src/components/StoreHoursBar.js','utf8')).match(/title: '([^']+)'/)[1];
  const results=[];
  for(const path of ['/', '/homepage-preview?template=body-refresh', '/homepage-preview?template=classic-shell']) {
    const began=performance.now();
    const response=await fetch('http://localhost:3000'+path);
    assert.equal(response.status,200);
    const html=await response.text();
    const markup=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
    assert.ok(markup.includes('aria-label="'+label+'"'), 'Prayer card absent in server HTML: '+path);
    assert.ok(markup.includes('aria-label="'+storeTitle+'"'), 'Store card absent in server HTML: '+path);
    const before=prayerRequests.length;
    await call('Page.navigate',{url:'http://localhost:3000'+path});
    let ready=false;
    for(let i=0;i<100;i++) {
      ready=await evaluate('!!document.querySelector('+JSON.stringify('[aria-label="'+label+'"]')+') && !!document.querySelector("form")');
      if(ready)break;
      await new Promise(r=>setTimeout(r,200));
    }
    assert.ok(ready);
    await new Promise(r=>setTimeout(r,1000));
    assert.equal(prayerRequests.length,before,'Unexpected client prayer fetch: '+path);
    results.push({path,serverHtmlContainsPrayerCard:true,serverHtmlContainsStoreCard:true,extraPrayerRequests:prayerRequests.length-before,totalCheckMs:Math.round(performance.now()-began)});
  }
  const apiTimings=[];
  for(let i=0;i<3;i++) {
    const began=performance.now();const res=await fetch('http://localhost:3000/api/weekly-prayers');
    assert.equal(res.status,200);const data=await res.json();assert.ok(data.schedule?.times?.length);
    apiTimings.push(Math.round(performance.now()-began));
  }
  assert.equal(errors.length,0,JSON.stringify(errors));
  console.log(JSON.stringify({results,warmApiMs:apiTimings,errors},null,2));
  await mkdir('tmp/homepage-redesign',{recursive:true});
  await writeFile('tmp/homepage-redesign/prayer-preload-report.json',JSON.stringify({results,warmApiMs:apiTimings,errors},null,2));
  await call('Browser.close').catch(()=>{});
} finally {socket?.close();browser.kill();}
