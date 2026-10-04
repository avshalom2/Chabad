import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

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
  await mkdir('tmp/homepage-redesign', { recursive: true });
  await call('Page.enable');
  await call('Runtime.enable');
  await call('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
  await call('Page.navigate', { url: 'http://localhost:3000/homepage-preview' });
  let loaded = false;
  for (let i = 0; i < 180; i++) {
    loaded = await evaluate(`!!document.querySelector('#classic-services a[href^="/articles/"]') && !!document.querySelector('#classic-articles a[href^="/articles/"]') && !!document.querySelector('[aria-label="זמני תפילה לשבוע הקרוב"]')`);
    if (loaded) break;
    await new Promise(r => setTimeout(r, 500));
  }
  assert.ok(loaded, 'Live content did not load');
  await evaluate('document.fonts.ready.then(() => true)');
  await evaluate('Promise.all(Array.from(document.images).filter(i => i.loading !== "lazy").map(i => i.decode().catch(() => {}))).then(() => true)');
  const report = [];
  for (const width of [1600, 900, 390]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    await new Promise(r => setTimeout(r, 600));
    await evaluate(`(async () => { for (const section of document.querySelectorAll('[data-homepage-design] > section')) { section.scrollIntoView(); await new Promise(r => setTimeout(r, 180)); } await Promise.all(Array.from(document.images).map(i => i.decode().catch(() => {}))); window.scrollTo(0, 0); return true; })()`);
    const metrics = await evaluate(`({width: innerWidth, scrollWidth: document.documentElement.scrollWidth, services: document.querySelectorAll('#classic-services a[href^="/articles/"]').length, articles: document.querySelectorAll('#classic-articles a[href^="/articles/"]').length, headerHidden: getComputedStyle(document.querySelector('[data-site-header]')).display === 'none', titleFont: getComputedStyle(document.querySelector('h1')).fontFamily, brokenImages: Array.from(document.images).filter(i=>i.complete && !i.naturalWidth).map(i=>i.src), invalidAnchors: Array.from(document.querySelectorAll('[data-homepage-design] a[href^="#"]')).filter(a=>!document.querySelector(a.getAttribute('href'))).map(a=>a.getAttribute('href'))})`);
    report.push(metrics);
    const size = await evaluate('({width: document.documentElement.clientWidth, height: document.documentElement.scrollHeight})');
    const capture = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: size.width, height: size.height, scale: width === 1600 ? 0.7 : 1 } });
    await writeFile(`tmp/homepage-redesign/preview-${width}.png`, Buffer.from(capture.data, 'base64'));
    if (width === 1600 || width === 390) {
      for (const [name, selector] of [['opening', '#classic-times'], ['services', '#classic-services'], ['articles', '#classic-articles']]) {
        const clip = await evaluate(`(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:Math.min(r.height,1100),scale:1}; })()`);
        const shot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip });
        await writeFile(`tmp/homepage-redesign/${name}-${width}.png`, Buffer.from(shot.data, 'base64'));
      }
    }
  }
  const mobileMenu = await evaluate(`(() => { const b = document.querySelector('button[aria-label="תפריט ניווט"]'); b.click(); return true; })()`);
  await new Promise(r => setTimeout(r, 200));
  assert.ok(mobileMenu && await evaluate(`document.querySelector('button[aria-label="תפריט ניווט"]').getAttribute('aria-expanded') === 'true'`));
  assert.equal(await evaluate(`document.querySelector('#classic-contact form').checkValidity()`), false, 'Empty contact form should be invalid');
  await writeFile('tmp/homepage-redesign/browser-report.json', JSON.stringify({ report, errors, consoleErrors }, null, 2));
  console.log(JSON.stringify({ report, errors, consoleErrors }, null, 2));
  assert.ok(report.every(m => m.scrollWidth <= m.width), 'Page overflows horizontally');
  assert.ok(report.every(m => m.headerHidden && m.invalidAnchors.length === 0), 'Navigation problem');
  assert.equal(errors.length, 0, 'Browser runtime errors');
  await call('Page.navigate', { url: 'http://localhost:3000/' });
  for (let i = 0; i < 100; i++) {
    if (await evaluate(`!!document.querySelector('[class*="SmartGridRenderer"]')`)) break;
    await new Promise(r => setTimeout(r, 300));
  }
  assert.equal(await evaluate(`document.querySelector('[data-homepage-design="classic"]') === null && getComputedStyle(document.querySelector('[data-site-header]')).display !== 'none'`), true, 'Active homepage appearance changed');
  console.log('Active homepage still uses its original design.');
  await call('Browser.close').catch(() => {});
} finally { socket?.close(); browser.kill(); }
