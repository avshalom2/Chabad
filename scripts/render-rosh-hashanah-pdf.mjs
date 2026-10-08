import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const directory = resolve('public/uploads/holidays');
const basename = process.argv[2] || 'rosh-hashanah-step-by-step';
assert.match(basename, /^[a-z0-9-]+$/);
const html = await readFile(join(directory, `${basename}.html`), 'utf8');
const expectedPages = (html.match(/id="page-\d+"/g) || []).length;
assert.ok(expectedPages > 0);
const profile = await mkdtemp(join(tmpdir(), 'chabad-print-'));
const browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
let socket;
try {
  let port;
  for (let attempt = 0; attempt < 120; attempt++) {
    try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  assert.ok(port, 'Headless Edge did not start.');
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((done, reject) => { socket.onopen = done; socket.onerror = reject; });
  let sequence = 0;
  const pending = new Map();
  socket.onmessage = ({ data }) => {
    const response = JSON.parse(data);
    if (!response.id) return;
    const promise = pending.get(response.id);
    if (!promise) return;
    clearTimeout(promise.timer);
    pending.delete(response.id);
    if (response.error) promise.reject(new Error(JSON.stringify(response.error)));
    else promise.resolve(response.result);
  };
  const call = (method, params = {}) => new Promise((resolvePromise, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 30000);
    pending.set(id, { resolve: resolvePromise, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await call('Page.enable');
  await call('Page.navigate', { url: pathToFileURL(join(directory, `${basename}.html`)).href });
  for (let i = 0; i < 60; i++) {
    if (await evaluate(`document.readyState === "complete" && document.querySelectorAll(".page").length === ${expectedPages}`)) break;
    await new Promise(r => setTimeout(r, 100));
  }
  await evaluate('document.fonts.ready.then(() => true)');
  await evaluate(`Promise.all(Array.from(document.images).map(i => i.decode())).then(() => true)`);
  await call('Emulation.setEmulatedMedia', { media: 'print' });
  await call('Emulation.setDeviceMetricsOverride', { width: 703, height: 1029, deviceScaleFactor: 1, mobile: false });
  const layout = await evaluate(`Array.from(document.querySelectorAll('.page')).map(p => ({page:p.id, bottom:p.querySelector('.page-body').getBoundingClientRect().bottom, footer:p.querySelector('footer').getBoundingClientRect().top, width:p.scrollWidth, clientWidth:p.clientWidth}))`);
  console.log(JSON.stringify(layout));
  assert.equal(layout.length, expectedPages);
  assert.ok(layout.every(p => p.bottom < p.footer - 4 && p.width <= p.clientWidth), 'Content overlaps a footer or overflows a page.');
  assert.equal(await evaluate('document.querySelectorAll("a[href^=http]").length'), 0);
  const result = await call('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false, generateTaggedPDF: true });
  const pdf = Buffer.from(result.data, 'base64');
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  const count = (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length;
  assert.equal(count, expectedPages, 'Unexpected PDF pagination.');
  assert.ok(!pdf.toString('latin1').includes('/URI'), 'Unexpected external PDF link.');
  await writeFile(join(directory, `${basename}.pdf`), pdf);
  await call('Emulation.setDeviceMetricsOverride', { width: 703, height: 1029, deviceScaleFactor: 1, mobile: false });
  for (let number = 1; number <= expectedPages; number++) {
    await evaluate(`document.querySelectorAll('.page').forEach(p => p.style.display = p.id === 'page-${number}' ? 'block' : 'none')`);
    const clip = await evaluate(`(() => {const r=document.querySelector('#page-${number}').getBoundingClientRect();return {x:r.x+window.scrollX,y:r.y+window.scrollY,width:r.width,height:r.height,scale:1}})()`);
    const capture = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip });
    await writeFile(join(profile, `page-${number}.png`), Buffer.from(capture.data, 'base64'));
  }
  console.log(JSON.stringify({ pdf: join(directory, `${basename}.pdf`), pages: count, bytes: pdf.length, previews: profile }));
  await call('Browser.close').catch(() => {});
} finally {
  socket?.close();
  browser.kill();
}
