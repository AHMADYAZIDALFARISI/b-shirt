import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  escapeHtml, gridItemsHtml, cardHtml, imageAttrs, campaignCopyHtml, campaignPosterHtml, categoryTilesHtml, ambassadorsHtml, maxNewDiscount, promoHtml,
} from '../js/lib/render.js';

const data = JSON.parse(readFileSync(new URL('../catalog.json', import.meta.url), 'utf8'));
const cfg = data.site_config;
const count = (html, needle) => html.split(needle).length - 1;

test('escapeHtml neutralises markup', () => {
  assert.equal(escapeHtml('<img src=x onerror="a()">&\''), '&lt;img src=x onerror=&quot;a()&quot;&gt;&amp;&#39;');
});

test('grids: 4 new / 7 wanita / 8 pria; featured only in Wanita', () => {
  const g = (k) => gridItemsHtml(k, data.products, cfg);
  assert.equal(count(g('new'), '<li class="card'), 4);
  assert.equal(count(g('cewek'), '<li class="card'), 7);
  assert.equal(count(g('cowok'), '<li class="card'), 8);
  assert.equal(count(g('cewek'), 'card--featured'), 1);
  assert.ok(g('cewek').includes('card card--featured" data-product-id="ce-01"'));
  assert.equal(count(g('new'), 'card--featured'), 0);
});

test('gender label shown only in New Arrivals (Wanita/Pria presentation labels)', () => {
  assert.ok(gridItemsHtml('new', data.products, cfg).includes('<p class="card__meta">Pria</p>'));
  assert.ok(gridItemsHtml('new', data.products, cfg).includes('<p class="card__meta">Wanita</p>'));
  assert.equal(count(gridItemsHtml('cewek', data.products, cfg), 'card__meta'), 0);
});

test('product names with markup are escaped in cards', () => {
  const html = cardHtml({ ...data.products[0], name: '<script>x</script>' }, cfg);
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
});

test('buy link: exact configured URL, new tab, safe rel, descriptive label', () => {
  const html = cardHtml(data.products[0], cfg, { section: 'new' });
  assert.ok(html.includes(`href="${escapeHtml(cfg.global_shop_url)}"`));
  assert.ok(html.includes('target="_blank" rel="noopener noreferrer"'));
  assert.ok(html.includes('aria-label="Beli di Tokopedia: '));
});

test('missing purchase URL renders a disabled action, never a generic link', () => {
  const html = cardHtml(data.products[0], { ...cfg, global_shop_url: null });
  assert.ok(html.includes('buy--disabled'));
  assert.ok(!html.includes('href="https://tokopedia.com'));
});

test('responsive sources from image_sources', () => {
  const attrs = imageAttrs(data.products[0]);
  assert.match(attrs, /srcset="assets\/products\/cw-01-400\.webp 400w, assets\/products\/cw-01-720\.webp 720w"/);
  assert.equal(imageAttrs('assets/x.webp'), 'src="assets/x.webp"');
});

test('campaign: real product photos, data-backed discount, real anchor', () => {
  const html = campaignCopyHtml(cfg, data.products) + campaignPosterHtml(cfg, data.products);
  assert.equal(maxNewDiscount(data.products), 30);
  assert.ok(html.includes('Diskon hingga 30%'));
  assert.ok(html.includes('href="#new-arrivals"'));
  assert.ok(html.includes('assets/products/cw-01-400.webp') && html.includes('assets/products/ce-01-400.webp'));
  assert.equal(count(html, 'fetchpriority="high"'), 1);
  assert.equal(campaignCopyHtml({ ...cfg, campaign: { ...cfg.campaign, active: false } }, data.products), '');
  assert.ok(html.includes('<h1 class="hero__title" id="campaign-title">'), 'headline is semantic DOM');
});


test('promo strip renders only when active', () => {
  assert.ok(promoHtml(cfg.promo_banner).includes('12.12 SALE'));
  assert.equal(promoHtml({ ...cfg.promo_banner, active: false }), '');
});

test('v4 category tiles: data-driven, real anchors, counts from data', () => {
  const html = categoryTilesHtml(cfg, data.products);
  assert.ok(html.includes('href="#area-cewek"') && html.includes('href="#area-cowok"'));
  assert.ok(html.includes('7 produk') && html.includes('8 produk'));
  assert.equal(categoryTilesHtml({ ...cfg, category_tiles: [{ gender: 'cewek', target: 'https://evil.example' }] }, data.products), '');
});

test('v4 ambassadors: images only, no invented names or quotes, links to real collections', () => {
  const html = ambassadorsHtml(cfg);
  assert.equal((html.match(/class="amb amb--/g) || []).length, 4);
  assert.ok(html.includes('href="#area-cowok"') && html.includes('href="#area-cewek"'));
  assert.ok(!/<blockquote|“|"[A-Z][a-z]+ [A-Z][a-z]+"/.test(html), 'no quotes or person names');
  const hidden = ambassadorsHtml({ ...cfg, ambassadors: { ...cfg.ambassadors, people: cfg.ambassadors.people.map((p) => ({ ...p, published: false })) } });
  assert.equal(hidden, '');
  assert.equal(ambassadorsHtml({ ...cfg, ambassadors: { ...cfg.ambassadors, active: false } }), '');
});
