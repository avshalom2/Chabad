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
  await mkdir('tmp/homepage-redesign', {recursive:true});
  await call('Page.enable'); await call('Runtime.enable');
  const report=[];
  for (const width of [1600,900,390]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await call('Page.navigate',{url:'http://localhost:3000/homepage-preview?template=body-refresh'});
    let ready=false;
    for(let i=0;i<120;i++) {
      ready=await evaluate(`!!document.querySelector('[data-opening-type="weekly-prayers"] section') && !!document.querySelector('[data-opening-type="store-hours"] section') && !!document.querySelector('[class*="joined"] a')`);
      if(ready) break; await new Promise(r=>setTimeout(r,500));
    }
    assert.ok(ready,'Body content did not load');
    await evaluate('document.fonts.ready.then(()=>true)');
    const metrics=await evaluate(`(()=>{const a=document.querySelector('[data-opening-type="weekly-prayers"] section').getBoundingClientRect();const b=document.querySelector('[data-opening-type="store-hours"] section').getBoundingClientRect();const card=document.querySelector('[class*="joined"] a');return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,prayerHeight:a.height,storeHeight:b.height,topDifference:Math.abs(a.top-b.top),radius:getComputedStyle(card).borderRadius,gap:getComputedStyle(card.parentElement).gap,headerVisible:getComputedStyle(document.querySelector('[data-site-header]')).display!=='none',shell:!!document.querySelector('[data-homepage-design]'),titleFont:getComputedStyle(card.querySelector('h3')).fontFamily,titleSize:getComputedStyle(card.querySelector('h3')).fontSize,mediaRadius:getComputedStyle(card.querySelector('div')).borderRadius,cardPadding:getComputedStyle(card).padding};})()`);
    assert.ok(metrics.scrollWidth<=width,'Horizontal overflow');
    assert.ok(metrics.headerVisible&&!metrics.shell,'Unexpected shell');
    assert.equal(metrics.radius,'0px');assert.equal(metrics.gap,'0px');assert.equal(metrics.mediaRadius,'0px');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('[data-homepage-body="body-refresh"]')).paddingTop`), '24px');
    assert.equal(await evaluate(`Array.from(document.querySelectorAll('[data-homepage-body="body-refresh"] *')).every(el => getComputedStyle(el).borderRadius === '0px')`), true, 'Rounded element in body');
    if(width>600){assert.ok(metrics.topDifference<1);assert.ok(Math.abs(metrics.prayerHeight-metrics.storeHeight)<1);}
    report.push(metrics);
    const size=await evaluate('({width:innerWidth,height:document.documentElement.scrollHeight})');
    const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,...size,scale:1}});
    await writeFile('tmp/homepage-redesign/body-refresh-'+width+'.png',Buffer.from(shot.data,'base64'));
  }
  await call('Page.navigate',{url:'http://localhost:3000/'});
  for(let i=0;i<120;i++){if(await evaluate(`!!document.querySelector('a[href="/articles/mezuzah-installation"]')`))break;await new Promise(r=>setTimeout(r,500));}
  const active=await evaluate(`(()=>{const card=document.querySelector('a[href="/articles/mezuzah-installation"]');return {radius:getComputedStyle(card).borderRadius,gap:getComputedStyle(card.parentElement).gap,titleFont:getComputedStyle(card.querySelector('h3')).fontFamily,titleSize:getComputedStyle(card.querySelector('h3')).fontSize,mediaRadius:getComputedStyle(card.querySelector('div')).borderRadius,cardPadding:getComputedStyle(card).padding,bodyRefresh:!!document.querySelector('[data-homepage-body="body-refresh"]')};})()`);
  assert.equal(active.radius,'20px');assert.equal(active.bodyRefresh,false);
  for(const key of ['titleFont','titleSize','cardPadding']) assert.equal(report[2][key],active[key],key+' changed');
  assert.equal(errors.length,0);console.log(JSON.stringify({report,active,errors},null,2));
  await writeFile('tmp/homepage-redesign/body-refresh-report.json',JSON.stringify({report,active,errors},null,2));
  await call('Browser.close').catch(()=>{});
} finally {socket?.close();browser.kill();}
