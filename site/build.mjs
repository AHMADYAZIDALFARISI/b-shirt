// Production build: node build.mjs  →  dist/
// - validates catalog.json (fails the build on bad data)
// - inlines and minifies tokens.css + styles.css (no render-blocking CSS requests)
// - pre-renders promo, campaign, collection stage nodes, grids and counts (final first paint, CLS 0)
// - preloads the first campaign photo (the mobile LCP element)
// - versions catalog.json by content hash so data updates are never served stale
// - rewrites og:image to an absolute URL when site_config.site_url is set
// No dependencies.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validateCatalog, publishedProducts } from './js/lib/catalog.js';
import {
  gridItemsHtml, productsFor, promoHtml, campaignCopyHtml, campaignPosterHtml, categoryTilesHtml, ambassadorsHtml, escapeHtml, imageAttrs,
  orbitView, orbitChipsHtml, orbitPanelHtml,
} from './js/lib/render.js';
import { FILTERS, orbitProducts } from './js/3d/orbit-model.js';

const root = new URL('./', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const dist = new URL('dist/', root);

const catalogText = read('catalog.json');
const catalog = JSON.parse(catalogText);
const { site_config: config } = catalog;
// Unpublished entries ("published": false) stay in the data but never reach the page.
const products = publishedProducts(catalog.products);

const errors = validateCatalog(catalog);
for (const p of [...catalog.products, ...(config.ambassadors?.people || [])]) {
  for (const s of p.image_sources ?? [{ src: p.image }]) {
    if (!/^https?:/.test(s.src) && !existsSync(new URL(s.src, root))) errors.push(`${p.id}: image file missing (${s.src})`);
  }
}
if (errors.length) {
  console.error('catalog.json is invalid:\n- ' + errors.join('\n- '));
  process.exit(1);
}

const minifyCss = (css) => css
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{}:;,>])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();

// CSS lives in css/ (urls are ../assets/…); once inlined into index.html they must be assets/….
const css = minifyCss(read('css/tokens.css') + '\n' + read('css/styles.css')).replaceAll('url("../assets/', 'url("assets/');
const hash = createHash('sha256').update(catalogText).digest('hex').slice(0, 10);
const catalogUrl = `catalog.json?v=${hash}`;

// LCP on mobile is the first campaign photo; fall back to the first New Arrival.
const campaignFirst = (config.campaign?.active && config.campaign.product_ids?.[0])
  ? products.find((p) => p.id === config.campaign.product_ids[0]) : null;
const lcpProduct = campaignFirst ?? productsFor('new', products)[0];
const lcpSizes = campaignFirst ? '(min-width: 1024px) 420px, 50vw' : undefined;
// The preload must request exactly what the <img> will pick, so reuse its srcset/sizes.
const preloadAttrs = (product) => imageAttrs(product, lcpSizes)
  .replace(/^src=/, 'href=')
  .replace(' srcset=', ' imagesrcset=')
  .replace(' sizes=', ' imagesizes=');

let html = read('index.html');
html = html.replace(/<!-- build:css -->[\s\S]*?<!-- \/build:css -->/, `<style>${css}</style>`);
html = html.replace(
  /<link rel="preload" href="catalog\.json"[^>]*>/,
  `<script>window.CATALOG_URL=${JSON.stringify(catalogUrl)}</script>\n  <link rel="preload" href="${catalogUrl}" as="fetch" crossorigin="anonymous">` +
    (lcpProduct ? `\n  <link rel="preload" as="image" ${preloadAttrs(lcpProduct)} fetchpriority="high">` : ''),
);
html = html.replace(/<!-- \/?build:preloads -->\n?/g, '');

// Promo strip
const promo = promoHtml(config.promo_banner);
html = promo
  ? html.replace('<p class="container promo__inner" data-promo></p>', `<p class="container promo__inner" data-promo data-prerendered>${promo}</p>`)
  : html.replace(/<div class="promo" data-promo-bar>[\s\S]*?<\/div>\n/, '');

// Hero: campaign copy (DOM) + campaign photo poster (LCP, same-footprint 3D fallback)
html = html.replace('<div class="hero__copy" data-campaign-copy></div>',
  `<div class="hero__copy" data-campaign-copy data-prerendered>${campaignCopyHtml(config, products)}</div>`);
html = html.replace('<div class="poster" data-campaign-poster></div>',
  `<div class="poster" data-campaign-poster data-prerendered>${campaignPosterHtml(config, products)}</div>`);

// Category tiles (FR-005)
html = html.replace('<ul class="tiles" role="list" data-categories></ul>',
  `<ul class="tiles" role="list" data-categories data-prerendered>${categoryTilesHtml(config, products)}</ul>`);

// Brand ambassadors (owner request): omitted entirely when inactive or empty.
{
  const amb = ambassadorsHtml(config);
  if (amb) {
    html = html.replace('<ul class="amb-grid" role="list" data-ambassadors></ul>', `<ul class="amb-grid" role="list" data-ambassadors data-prerendered>${amb}</ul>`);
    const a = config.ambassadors;
    if (a.eyebrow) html = html.replace('data-amb-eyebrow>Brand Ambassador<', `data-amb-eyebrow>${escapeHtml(a.eyebrow)}<`);
    if (a.title) html = html.replace('data-amb-title>Wajah b-shirt<', `data-amb-title>${escapeHtml(a.title)}<`);
    if (a.text) html = html.replace('data-amb-text>Gaya keseharian yang mewakili karakter b-shirt.<', `data-amb-text>${escapeHtml(a.text)}<`);
  } else {
    html = html.replace(/<section class="ambassadors"[\s\S]*?<\/section>\n/, '');
  }
}

// Interactive orbit: pre-render filters, the default product panel and its 2D photo, so the
// section is complete (and shoppable) before any JavaScript or WebGL runs.
{
  const ring = orbitProducts(products, 'all');
  const start = Math.max(0, ring.findIndex((p) => p.id === config.stage?.default_product));
  const v = orbitView(ring[start], config, start, ring.length);
  const preChips = orbitChipsHtml(FILTERS, 'all').replace(
    /data-orbit-filter="([^"]+)"([^>]*)>([^<]+)<\/button>/g,
    (_m, key, rest, label) => `data-orbit-filter="${key}"${rest}>${label}<span class="chip__count">${orbitProducts(products, key).length}</span></button>`,
  );
  html = html.replace('<div class="chips" role="group" aria-label="Tampilkan koleksi di rak" data-orbit-chips></div>',
    `<div class="chips" role="group" aria-label="Tampilkan koleksi di rak" data-orbit-chips data-prerendered>${preChips}</div>`);
  html = html.replace('<div class="pick" data-orbit-panel></div>', `<div class="pick" data-orbit-panel>${orbitPanelHtml(v)}</div>`);
  html = html.replace('<img class="stage__photo" data-orbit-photo alt=""',
    `<img class="stage__photo" data-orbit-photo src="${escapeHtml(v.photo.src)}" srcset="${escapeHtml(v.photo.srcset)}" sizes="(min-width: 1024px) 640px, 90vw" data-position="${escapeHtml(v.photo.position)}" alt="${escapeHtml(v.name)}" loading="lazy"`);
  html = html.replace('data-orbit>', `data-orbit data-accent="${v.accent}">`);
  if (config.stage?.title) html = html.replace('>Putar rak koleksi</h2>', `>${escapeHtml(config.stage.title)}</h2>`);
}

// Grids & counts
for (const key of ['new', 'cewek', 'cowok']) {
  html = html.replace(`data-grid="${key}"></ul>`, `data-grid="${key}" data-prerendered>${gridItemsHtml(key, products, config)}</ul>`);
  html = html.replace(`<p class="section__count" data-count="${key}"></p>`,
    `<p class="section__count" data-count="${key}">${productsFor(key, products).length} produk</p>`);
}

// Static text the script would otherwise fill in (avoids reflow on the visible area)
html = html.replaceAll('<span data-hours-label></span>', `<span data-hours-label>${escapeHtml(config.operating_hours.label)}</span>`);

// Official logo (assets/brand/, made by tools/make_logo_assets.py). Text wordmark stays as fallback.
const brand = (f) => new URL(`assets/brand/${f}`, root);
if (existsSync(brand('logo-wordmark.png'))) {
  const png = readFileSync(brand('logo-wordmark.png'));
  const w = png.readUInt32BE(16), h = png.readUInt32BE(20); // PNG IHDR
  const headerH = 28;
  const img = (cls, height) =>
    `<img class="${cls}" src="assets/brand/logo-wordmark.png" alt="b-shirt" width="${Math.round(w * height / h)}" height="${height}">`;
  html = html.replace(/(<a class="brand" href="#top"[^>]*>)b-shirt(<\/a>)/, `$1${img('brand__logo', headerH)}$2`);
  html = html.replace('<p class="brand brand--footer">b-shirt</p>',
    existsSync(brand('logo-full.png'))
      ? '<p class="brand brand--footer"><img class="brand__logo-full" src="assets/brand/logo-full.png" alt="b-shirt" width="88" height="110" loading="lazy"></p>'
      : `<p class="brand brand--footer">${img('brand__logo', 22)}</p>`);
}
if (existsSync(brand('favicon-32.png'))) {
  html = html.replace(/<link rel="icon"[^>]*>/,
    '<link rel="icon" type="image/png" sizes="32x32" href="assets/brand/favicon-32.png">' +
    (existsSync(brand('apple-touch-icon.png')) ? '\n  <link rel="apple-touch-icon" href="assets/brand/apple-touch-icon.png">' : ''));
}

// Absolute og:image when the live domain is known
if (config.site_url) {
  const base = config.site_url.replace(/\/+$/, '');
  html = html.replace(/<meta property="og:image" content="([^"]+)">/, (_, p) => `<meta property="og:image" content="${escapeHtml(`${base}/${p}`)}">`);
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
writeFileSync(new URL('index.html', dist), html);
writeFileSync(new URL('catalog.json', dist), catalogText);
cpSync(new URL('js/', root), new URL('js/', dist), { recursive: true });
cpSync(new URL('assets/', root), new URL('assets/', dist), { recursive: true });

console.log(`Built dist/ — css ${css.length} B inlined, catalog v=${hash}, LCP preload: ${lcpProduct?.id ?? 'none'}`);
