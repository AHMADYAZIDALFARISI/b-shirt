// End-to-End Browser QA + WCAG 2.2 AA Accessibility (axe-core) Suite via Playwright.
// Serves site/dist/ locally on an ephemeral port and exercises all user journeys across viewports.
import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const DIST = resolve(new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const REPORT_DIR = resolve(new URL('../../docs/reports/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
mkdirSync(REPORT_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function startServer() {
  const server = http.createServer((req, res) => {
    const cleanUrl = (req.url || '/').split('?')[0];
    const rel = cleanUrl === '/' ? 'index.html' : cleanUrl.replace(/^\/+/, '');
    const file = join(DIST, rel);
    if (!file.startsWith(DIST) || !existsSync(file)) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise((res) => {
    server.listen(0, '127.0.0.1', () => res(server));
  });
}

function getChromeExecutable() {
  const winChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  return existsSync(winChrome) ? winChrome : undefined;
}

const server = await startServer();
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}/index.html`;
const executablePath = getChromeExecutable();

const browser = await chromium.launch({
  ...(executablePath ? { executablePath } : {}),
  args: ['--enable-webgl', '--ignore-gpu-blocklist'],
});

const e2eResults = [];
const record = (name, status, details = '') => {
  e2eResults.push({ test: name, status, details });
  console.log(`${status === 'PASS' ? '✔' : '✖'} ${name}${details ? ` — ${details}` : ''}`);
};

try {
  // ── 1. Desktop E2E User Journeys & Live WebGL ─────────────────────
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  // 1a. Catalog counts & headline
  const counts = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent.trim(),
    newCount: document.querySelectorAll('[data-grid="new"] > li.card').length,
    cewekCount: document.querySelectorAll('[data-grid="cewek"] > li.card').length,
    cowokCount: document.querySelectorAll('[data-grid="cowok"] > li.card').length,
    ambCount: document.querySelectorAll('[data-ambassadors] > li.amb').length,
    tilesCount: document.querySelectorAll('[data-categories] > li').length,
  }));
  assert.equal(counts.newCount, 4);
  assert.equal(counts.cewekCount, 7);
  assert.equal(counts.cowokCount, 8);
  assert.equal(counts.ambCount, 4);
  assert.equal(counts.tilesCount, 2);
  record('Landing page catalog & section integrity', 'PASS', `${counts.h1} (4 new / 7 women / 8 men / 4 amb)`);

  // 1b. Scroll engagement triggers WebGL live scene cleanly
  await page.mouse.move(700, 400);
  await page.mouse.wheel(0, 60);
  await page.waitForFunction(() => document.querySelector('[data-scene]')?.dataset.sceneState === 'live', { timeout: 6000 });
  record('WebGL 3D rack lazy-loads on user engagement', 'PASS', 'sceneState === live');

  // 1c. Filter chips update count, pressed state, sliding pill, and product panel
  await page.click('[data-orbit-filter="cowok"]');
  await page.waitForTimeout(150);
  const afterFilter = await page.evaluate(() => ({
    pressed: document.querySelector('[data-orbit-filter="cowok"]')?.getAttribute('aria-pressed'),
    counter: document.querySelector('[data-orbit-counter]')?.textContent.trim(),
    collection: document.querySelector('[data-orbit-collection]')?.textContent.trim(),
    name: document.querySelector('[data-orbit-name]')?.textContent.trim(),
    buyHref: document.querySelector('[data-orbit-buy]')?.getAttribute('href'),
  }));
  assert.equal(afterFilter.pressed, 'true');
  assert.match(afterFilter.counter, /\/\s*8$/);
  assert.equal(afterFilter.collection, 'Pria');
  assert.ok(afterFilter.buyHref.startsWith('https://shop-id.tokopedia.com/'));
  record('Category filtering updates rack, count, panel, and buy URL', 'PASS', `${afterFilter.name} (${afterFilter.counter})`);

  // 1d. Prev / Next / Keyboard navigation + regression: 2D overlay never covers live WebGL canvas across all 15 slots
  await page.click('[data-orbit-filter="all"]');
  await page.waitForTimeout(150);
  for (let step = 0; step < 15; step++) {
    await page.click('[data-orbit-next]');
    await page.waitForTimeout(55);
    const rackVis = await page.evaluate(() => {
      const vis = document.querySelector('[data-scene]');
      const photo = document.querySelector('[data-orbit-photo]');
      const canvas = document.querySelector('.stage__canvas');
      const cp = getComputedStyle(photo);
      const cc = getComputedStyle(canvas);
      return {
        state: vis?.dataset.sceneState,
        photoHidden: photo?.hidden,
        photoDisplay: cp.display,
        canvasOpacity: cc.opacity,
        canvasWidth: canvas?.getBoundingClientRect().width || 0,
      };
    });
    assert.equal(rackVis.state, 'live', `slot step ${step} keeps sceneState=live`);
    assert.equal(rackVis.photoHidden, true, `slot step ${step} keeps 2D stage__photo hidden`);
    assert.equal(rackVis.photoDisplay, 'none', `slot step ${step} hides 2D stage__photo overlay in CSS`);
    assert.equal(rackVis.canvasOpacity, '1', `slot step ${step} keeps 3D canvas visible`);
    assert.ok(rackVis.canvasWidth > 300);
  }

  // Test 3D canvas drag (>8px threshold) vs side-card tap picking
  const beforeDrag = await page.textContent('[data-orbit-counter]');
  const cBox = await page.locator('.stage__canvas').boundingBox();
  const cx = cBox.x + cBox.width * 0.5;
  const cy = cBox.y + cBox.height * 0.5;
  // Micro-jitter (<8px) without hitting left/right edge must not rotate rack via drag
  await page.mouse.move(cx, cBox.y + 20);
  await page.mouse.down();
  await page.mouse.move(cx + 4, cBox.y + 20);
  await page.mouse.up();
  await page.waitForTimeout(100);
  assert.equal(await page.textContent('[data-orbit-counter]'), beforeDrag, 'jitter <=8px does not drag-rotate');

  // Deliberate horizontal drag (>8px) rotates rack cleanly while keeping 2D overlay hidden
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx - 140, cy, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(150);
  const afterDrag = await page.textContent('[data-orbit-counter]');
  assert.notEqual(afterDrag, beforeDrag, 'horizontal drag >8px rotates rack');
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('[data-orbit-photo]')).display), 'none');

  // Tapping right neighbor card directly on 3D canvas switches active product
  await page.mouse.click(cBox.x + cBox.width * 0.72, cy);
  await page.waitForTimeout(180);
  const afterTap = await page.textContent('[data-orbit-counter]');
  assert.notEqual(afterTap, afterDrag, 'tapping neighbor card in 3D canvas selects it');

  await page.click('[data-orbit-filter="cowok"]');
  await page.waitForTimeout(120);
  const firstName = (await page.textContent('[data-orbit-name]'))?.trim();
  await page.click('[data-orbit-next]');
  await page.waitForTimeout(120);
  const nextName = await page.textContent('[data-orbit-name]');
  assert.notEqual(nextName?.trim(), firstName);
  await page.focus('[data-orbit-next]');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(120);
  const prevName = await page.textContent('[data-orbit-name]');
  assert.equal(prevName?.trim(), firstName);
  record('All 15 WebGL slots, drag >8px, side-card tap & keyboard sync pass cleanly', 'PASS');

  // 1e. Extensible Product Detail Modal + Escape focus restore + Rack sync
  const detailTrigger = page.locator('[data-grid="new"] [data-product-detail]').first();
  await detailTrigger.click();
  await page.waitForSelector('#product-modal[open]');
  const modalState = await page.evaluate(() => ({
    title: document.querySelector('#pmodal-title')?.textContent.trim(),
    hasBuy: Boolean(document.querySelector('.pmodal__buy')?.getAttribute('href')?.startsWith('https://shop-id.tokopedia.com/')),
    hasWa: Boolean(document.querySelector('.pmodal__ask')?.getAttribute('href')?.startsWith('https://wa.me/6282230089520')),
    closeFocused: document.activeElement?.hasAttribute('data-modal-close'),
  }));
  assert.ok(modalState.title && modalState.hasBuy && modalState.hasWa);
  assert.equal(modalState.closeFocused, true, 'focus moves into modal close control');

  // Run axe-core WCAG 2.2 AA while modal is open
  await page.addScriptTag({ content: axeSource });
  const modalAxe = await page.evaluate(async () => await window.axe.run(document.getElementById('product-modal'), {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
  }));

  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.getElementById('product-modal')?.open);
  const focusRestored = await page.evaluate(() => document.activeElement?.getAttribute('data-product-detail'));
  assert.ok(focusRestored, 'Escape restores focus cleanly to opener');
  record('Product Detail Modal opens, binds Tokopedia/WA links, scans a11y & restores focus', 'PASS');

  // 1f. Full-page WCAG 2.2 AA scan
  const pageAxe = await page.evaluate(async () => await window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
  }));
  const criticalViolations = [...pageAxe.violations, ...modalAxe.violations].filter((v) => ['critical', 'serious'].includes(v.impact));
  writeFileSync(
    join(REPORT_DIR, 'a11y-report.json'),
    JSON.stringify({ pageViolations: pageAxe.violations, modalViolations: modalAxe.violations, passesCount: pageAxe.passes.length }, null, 2),
  );
  assert.equal(criticalViolations.length, 0, `Found critical/serious axe violations: ${criticalViolations.map((v) => v.id).join(', ')}`);
  record('WCAG 2.2 AA Axe scan (page + dialog)', 'PASS', `${pageAxe.violations.length} page violations, ${modalAxe.violations.length} modal violations`);

  // 1g. Tracking custom event verification + external links safety
  const eventsSeen = [];
  await page.exposeFunction('__captureEvent', (d) => eventsSeen.push(d));
  await page.evaluate(() => window.addEventListener('bshirt:track', (e) => window.__captureEvent(e.detail)));
  await page.click('[data-scene-toggle]');
  await page.waitForTimeout(100);
  assert.ok(eventsSeen.some((e) => e.event === 'scene_interaction'), 'tracks scene motion toggle');
  assert.equal(pageErrors.length, 0, `Unexpected desktop pageerrors: ${pageErrors.join('; ')}`);
  record('Motion toggle & tracking event emission without console errors', 'PASS');
  await ctx.close();

  // ── 2. Mobile Viewport + WhatsApp Zero Overlap + 2-Col Editorial ──
  for (const vp of [{ width: 360, height: 800 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
    const mCtx = await browser.newContext({ viewport: vp, hasTouch: true, isMobile: true });
    const mPage = await mCtx.newPage();
    const mErrors = [];
    mPage.on('pageerror', (e) => mErrors.push(e.message));
    await mPage.goto(baseUrl, { waitUntil: 'networkidle' });
    await mPage.waitForTimeout(350);

    const mob = await mPage.evaluate(() => {
      const fab = document.querySelector('.wa-fab');
      const fr = fab.getBoundingClientRect();
      const hiddenOrAway = fab.classList.contains('wa-fab--away') || getComputedStyle(fab).opacity === '0';
      const ctas = [...document.querySelectorAll('a.buy, .ask, .hero__cta, .pick__see, .pick__detail, .amb__link, .tile, .chip')];
      const overlaps = [];
      if (!hiddenOrAway) {
        for (const el of ctas) {
          const r = el.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) continue;
          if (r.right > fr.left && r.left < fr.right && r.bottom > fr.top && r.top < fr.bottom) {
            overlaps.push(el.textContent.trim());
          }
        }
      }
      const ambCols = new Set([...document.querySelectorAll('.amb')].map((el) => Math.round(el.getBoundingClientRect().top))).size;
      const small = [...document.querySelectorAll('a,button')].filter((e) => {
        if (e.closest('[hidden]') || !e.offsetParent) return false;
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44) && !e.closest('dd');
      });
      return {
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        overlaps,
        ambRowCount: ambCols,
        smallCount: small.length,
        waHref: fab.getAttribute('href'),
      };
    });

    assert.equal(mob.overflow, false, `${vp.width} overflow`);
    assert.deepEqual(mob.overlaps, [], `${vp.width} FAB overlapped ${mob.overlaps.join(',')}`);
    assert.equal(mob.ambRowCount, 2, `${vp.width} editorial section uses compact 2x2 grid (2 rows instead of 4)`);
    assert.equal(mob.smallCount, 0, `${vp.width} small targets`);
    assert.ok(mob.waHref.startsWith('https://wa.me/6282230089520'));
    // Test scroll-down hiding & keyboard focus rescue
    await mPage.evaluate(() => scrollTo({ top: 900, behavior: 'instant' }));
    await mPage.waitForTimeout(180);
    await mPage.focus('.wa-fab');
    const fabFocusedVisible = await mPage.evaluate(() => !document.querySelector('.wa-fab').classList.contains('wa-fab--away'));
    assert.equal(fabFocusedVisible, true, 'FAB becomes visible on keyboard focus even mid-scroll');
    assert.equal(mErrors.length, 0);
    await mCtx.close();
    record(`Mobile ${vp.width}x${vp.height}: 0 overflow, 0 FAB overlap, 2x2 editorial, focusable WA`, 'PASS');
  }

  // ── 3. Reduced Motion & Poster Fallback Scenarios ──────────────────
  const rmCtx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const rmPage = await rmCtx.newPage();
  await rmPage.goto(baseUrl, { waitUntil: 'networkidle' });
  await rmPage.mouse.wheel(0, 40);
  await rmPage.waitForTimeout(800);
  const rmState = await rmPage.evaluate(() => ({
    mode: document.querySelector('[data-scene]')?.dataset.sceneMode,
    running: document.querySelector('[data-scene]')?.dataset.sceneRunning,
    toggleHidden: document.querySelector('[data-scene-toggle]')?.hidden,
  }));
  assert.equal(rmState.mode, 'still');
  assert.notEqual(rmState.running, 'true');
  assert.equal(rmState.toggleHidden, true);
  await rmCtx.close();
  record('Reduced motion runs still-frame mode cleanly', 'PASS');

  const offCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const offPage = await offCtx.newPage();
  await offPage.goto(`${baseUrl}?scene=off`, { waitUntil: 'networkidle' });
  const offState = await offPage.evaluate(() => ({
    mode: document.querySelector('[data-scene]')?.dataset.sceneMode,
    state: document.querySelector('[data-scene]')?.dataset.sceneState,
    posterVisible: getComputedStyle(document.querySelector('.poster')).visibility !== 'hidden',
    buyHref: document.querySelector('[data-orbit-buy]')?.getAttribute('href'),
  }));
  assert.equal(offState.mode, 'poster');
  assert.equal(offState.state, 'poster');
  assert.equal(offState.posterVisible, true);
  assert.ok(offState.buyHref.startsWith('https://shop-id.tokopedia.com/'));
  await offPage.click('[data-orbit-next]');
  await offPage.waitForTimeout(100);
  const offAfterPick = await offPage.evaluate(() => ({
    state: document.querySelector('[data-scene]')?.dataset.sceneState,
    photoHidden: document.querySelector('[data-orbit-photo]')?.hidden,
    photoDisplay: getComputedStyle(document.querySelector('[data-orbit-photo]')).display,
  }));
  assert.equal(offAfterPick.state, 'photo');
  assert.equal(offAfterPick.photoHidden, false);
  assert.notEqual(offAfterPick.photoDisplay, 'none');
  await offCtx.close();
  record('Poster fallback preserves full 2D catalog, photo pick mode & purchasing without WebGL', 'PASS');

  writeFileSync(join(REPORT_DIR, 'e2e-report.json'), JSON.stringify({ timestamp: new Date().toISOString(), results: e2eResults }, null, 2));
} finally {
  await browser.close();
  server.close();
}
