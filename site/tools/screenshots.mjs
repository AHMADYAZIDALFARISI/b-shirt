// QA helper: device-emulated screenshots + layout, lazy-image, WebGL & CTA-overlap checks through CDP.
// Uses Node built-in fetch/WebSocket + local Chrome.
//
//   node tools/screenshots.mjs <url> <outDir> [--reduced-motion] [--full]
//   CHROME_FLAGS="--disable-webgl" node tools/screenshots.mjs ...
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const args = process.argv.slice(2);
const [url, outDir] = args.filter((a) => !a.startsWith('--'));
const reducedMotion = args.includes('--reduced-motion');
const fullPage = args.includes('--full');
if (!url || !outDir) {
  console.error('usage: node tools/screenshots.mjs <url> <outDir> [--reduced-motion] [--full]');
  process.exit(1);
}

const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SIZES = [[360, 800], [375, 812], [390, 844], [414, 896], [430, 932], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080]];
const port = 9300 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(join(tmpdir(), 'bshirt-cdp-'));
const chrome = spawn(chromePath, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--hide-scrollbars', '--enable-webgl', '--ignore-gpu-blocklist',
  ...(process.env.CHROME_FLAGS ? process.env.CHROME_FLAGS.split(' ') : []), 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function target() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* wait for Chrome */ }
    await sleep(200);
  }
  throw new Error('Chrome DevTools endpoint not reachable');
}

const ws = new WebSocket(await target());
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
const consoleErrors = [];
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  if (msg.method === 'Runtime.exceptionThrown') consoleErrors.push(msg.params.exceptionDetails.text);
  if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') consoleErrors.push(msg.params.entry.text);
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = ++seq;
  pending.set(id, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)));
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (res.exceptionDetails) throw new Error(res.exceptionDetails.text || 'Eval exception');
  return res.result.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
if (reducedMotion) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });

mkdirSync(outDir, { recursive: true });
const report = [];
for (const [width, height] of SIZES) {
  const mobile = width < 768;
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  await send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
  consoleErrors.length = 0;
  await send('Page.navigate', { url });
  await sleep(1600);

  const checks = await evaluate(`(async () => {
    const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms));
    // Scroll deliberately through the entire page to trigger every lazy-loaded image & WebGL observer.
    const step = Math.max(240, Math.floor(innerHeight * 0.65));
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      scrollTo({ top: y, behavior: 'instant' });
      await sleepMs(140);
    }

    // Explicitly bring every active catalog/editorial/brand image into view and await load + decode.
    const imgs = [...document.images].filter((img) => {
      const hiddenEl = img.closest('[hidden]');
      return !hiddenEl && Boolean(img.getAttribute('src'));
    });

    const waitImage = (img, timeoutMs = 8000) => new Promise((resolve) => {
      const finish = (ok, reason = '') => resolve({ ok, reason });
      if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        if (typeof img.decode === 'function') {
          img.decode().then(() => finish(true)).catch(() => finish(true));
        } else {
          finish(true);
        }
        return;
      }
      if (img.complete && img.naturalWidth === 0) {
        finish(false, 'naturalWidth=0');
        return;
      }
      let settled = false;
      const done = (ok, reason) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onErr);
        finish(ok, reason);
      };
      const onLoad = () => {
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          done(false, 'zero-dimensions-after-load');
        } else if (typeof img.decode === 'function') {
          img.decode().then(() => done(true)).catch(() => done(false, 'decode-error'));
        } else {
          done(true);
        }
      };
      const onErr = () => done(false, 'load-error');
      const timer = setTimeout(() => {
        if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) done(true);
        else done(false, 'load-timeout');
      }, timeoutMs);
      img.addEventListener('load', onLoad, { once: true });
      img.addEventListener('error', onErr, { once: true });
    });

    const failedImages = [];
    for (const img of imgs) {
      if (!img.complete || img.naturalWidth === 0) {
        img.scrollIntoView({ block: 'center' });
        await sleepMs(60);
      }
      const res = await waitImage(img, 8000);
      if (!res.ok) {
        const comp = img.closest('[data-grid]')?.dataset.grid
          || img.closest('.ambassadors')?.id
          || img.closest('.categories')?.className
          || img.closest('.poster')?.className
          || img.closest('header,footer')?.tagName?.toLowerCase()
          || 'unknown';
        failedImages.push({
          src: (img.currentSrc || img.getAttribute('src') || '').split('/').pop(),
          alt: img.getAttribute('alt') || '',
          component: comp,
          reason: res.reason,
        });
      }
    }

    // Return cleanly to top so fixed/sticky UI sits in initial resting state before layout checks/capture.
    scrollTo({ top: 0, behavior: 'instant' });
    await sleepMs(350);

    const anchors = [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h.length > 1);
    const small = [...document.querySelectorAll('a,button')].filter((e) => {
      if (e.closest('[hidden]') || !e.offsetParent) return false;
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44) && !e.closest('dd');
    }).map((e) => (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 24));

    const fab = document.querySelector('.wa-fab');
    const ctaOverlaps = [];
    if (fab && !fab.classList.contains('wa-fab--away') && getComputedStyle(fab).opacity !== '0') {
      const fr = fab.getBoundingClientRect();
      for (const el of document.querySelectorAll('a.buy, .ask, .hero__cta, .pick__see, .pick__detail, .amb__link, .tile, .chip')) {
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        if (r.right > fr.left && r.left < fr.right && r.bottom > fr.top && r.top < fr.bottom) {
          ctaOverlaps.push((el.textContent || el.className).trim().slice(0, 30));
        }
      }
    }

    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      deadAnchors: anchors.filter((h) => !document.querySelector(h)),
      checkedImageCount: imgs.length,
      failedImages,
      smallTargets: small,
      ctaOverlaps,
      scene: document.querySelector('[data-scene]')?.dataset.sceneState ?? null,
    };
  })()`);

  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: fullPage });
  const file = resolve(join(outDir, `${width}x${height}.png`));
  writeFileSync(file, Buffer.from(shot.data, 'base64'));
  report.push({ viewport: `${width}x${height}`, ...checks, consoleErrors: [...consoleErrors] });
}

writeFileSync(resolve(join(outDir, 'checks.json')), JSON.stringify(report, null, 2));
for (const r of report) {
  console.log(`${r.viewport.padEnd(10)} overflow=${r.overflow} dead=${r.deadAnchors.length} imgs=${r.checkedImageCount} failedImg=${r.failedImages.length} small=${r.smallTargets.length} overlap=${r.ctaOverlaps.length} scene=${r.scene} errors=${r.consoleErrors.length}`);
}

const totalImgFails = report.reduce((acc, r) => acc + r.failedImages.length, 0);
const totalErrors = report.reduce((acc, r) => acc + r.consoleErrors.length, 0);
ws.close();
chrome.kill();
await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome may still hold files */ }
if (totalImgFails > 0 || totalErrors > 0) process.exit(1);
