// Repeatable Lighthouse audit script (Mobile + Desktop) against local dist/.
import http from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import lighthouse from 'lighthouse';
import { spawn } from 'node:child_process';

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

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const { port } = server.address();
const url = `http://127.0.0.1:${port}/index.html`;
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const dbgPort = 9450 + Math.floor(Math.random() * 200);
const profile = mkdtempSync(join(tmpdir(), 'bshirt-lh-'));
const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${dbgPort}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-extensions',
  'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 40; i += 1) {
  try {
    const r = await fetch(`http://127.0.0.1:${dbgPort}/json/version`);
    if (r.ok) break;
  } catch {}
  await sleep(200);
}

const pct = (v) => Math.round((v ?? 0) * 100);
const metric = (lhr, id) => ({
  display: lhr.audits[id]?.displayValue || 'n/a',
  ms: lhr.audits[id]?.numericValue ?? null,
});

try {
  const summary = {};
  for (const formFactor of ['mobile', 'desktop']) {
    const res = await lighthouse(url, {
      port: dbgPort,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor,
      screenEmulation: formFactor === 'desktop'
        ? { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }
        : { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
      throttlingMethod: 'simulate',
    });
    const lhr = res.lhr;
    writeFileSync(join(REPORT_DIR, `lighthouse-${formFactor}.json`), res.report);
    summary[formFactor] = {
      performance: pct(lhr.categories.performance.score),
      accessibility: pct(lhr.categories.accessibility.score),
      bestPractices: pct(lhr.categories['best-practices'].score),
      seo: pct(lhr.categories.seo.score),
      fcp: metric(lhr, 'first-contentful-paint').display,
      lcp: metric(lhr, 'largest-contentful-paint').display,
      tbt: metric(lhr, 'total-blocking-time').display,
      cls: metric(lhr, 'cumulative-layout-shift').display,
    };
    console.log(formFactor.toUpperCase(), JSON.stringify(summary[formFactor]));
  }
  writeFileSync(join(REPORT_DIR, 'lighthouse-summary.json'), JSON.stringify(summary, null, 2));
} finally {
  chrome.kill();
  server.close();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
