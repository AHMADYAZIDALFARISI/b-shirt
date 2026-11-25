import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { getAdminStatus, nextOpenLabel } from '../js/lib/status.js';
import { calcDiscount, formatRupiah, hasValidPromo } from '../js/lib/price.js';
import { resolvePurchaseUrl, buildWhatsAppUrl, isAllowedShopUrl, productQuestion } from '../js/lib/links.js';
import { newArrivals, byGender, featuredForOddGrid, validateCatalog } from '../js/lib/catalog.js';
import { track, buildEvent, EVENTS } from '../js/lib/track.js';

const data = JSON.parse(readFileSync(new URL('../catalog.json', import.meta.url), 'utf8'));
const cfg = data.site_config;
const hours = cfg.operating_hours;

// WIB is UTC+7, so a WIB wall-clock time maps to UTC by subtracting 7 hours.
const wib = (isoLocal) => new Date(`${isoLocal}+07:00`);

test('admin status boundaries (SRS 3.2) — Monday 2026-11-23', () => {
  assert.equal(getAdminStatus(hours, wib('2026-11-23T07:59:59')).online, false);
  assert.equal(getAdminStatus(hours, wib('2026-11-23T08:00:00')).online, true);
  assert.equal(getAdminStatus(hours, wib('2026-11-23T16:59:59')).online, true);
  assert.equal(getAdminStatus(hours, wib('2026-11-23T17:00:00')).online, false);
});

test('admin status: Saturday open, Sunday always closed', () => {
  assert.equal(getAdminStatus(hours, wib('2026-11-28T10:00:00')).online, true);
  assert.equal(getAdminStatus(hours, wib('2026-11-29T10:00:00')).online, false);
  assert.equal(getAdminStatus(hours, wib('2026-11-29T00:00:00')).label, 'Di Luar Jam Operasional');
});

test('admin status ignores device timezone (instant-based)', () => {
  // 2026-11-23T01:30Z is Monday 08:30 WIB but Sunday evening in the Americas.
  assert.equal(getAdminStatus(hours, new Date('2026-11-23T01:30:00Z')).online, true);
});

test('admin status fails closed on bad config', () => {
  const s = getAdminStatus({ ...hours, timezone: 'Not/AZone' }, new Date());
  assert.equal(s.known, false);
  assert.equal(s.online, false);
});

test('discounts match PRD for the seven baseline products', () => {
  assert.deepEqual(data.products.slice(0, 7).map(calcDiscount), [29, 26, 30, 28, 26, 28, 29]);
});

test('v4: baseline catalog (PRD §9 table) is byte-for-byte unchanged and first in order', () => {
  const baseline = [
    ['cw-01', 'cowok', 'Korean Camel Oversized Coat & Turtleneck Look', true, false, 349000, 249000],
    ['cw-02', 'cowok', 'Basic White Tee & Light-Wash Baggy Jeans', true, false, 229000, 169000],
    ['ce-01', 'cewek', 'Earth-Tone Knit Vest & Pleated Culotte Set', true, true, 269000, 189000],
    ['ce-02', 'cewek', 'Sky Blue Lace-Trim Wide Leg Trousers', true, false, 179000, 129000],
    ['ce-03', 'cewek', 'Ivory High-Waist Corduroy Wide Pants', false, false, 189000, 139000],
    ['ce-04', 'cewek', 'Black Midi Dress & Cream Cropped Cardigan Set', false, false, 249000, 179000],
    ['ce-05', 'cewek', 'Blush Floral Ruffle Dress & Crochet Bolero Set', false, false, 259000, 185000],
  ];
  baseline.forEach(([id, gender, name, isNew, featured, o, p], i) => {
    const x = data.products[i];
    assert.deepEqual([x.id, x.gender, x.name, x.is_new, x.is_featured, x.original_price, x.promo_price], [id, gender, name, isNew, featured, o, p]);
    assert.equal(x.product_url, null);
    assert.equal(x.image, `assets/products/${id}-400.webp`);
  });
});

test('v4 owner revision: 8 added products have valid prices, real images and no unsupported claims', () => {
  const added = data.products.slice(7);
  assert.deepEqual(added.map((p) => p.id), ['cw-03', 'cw-04', 'cw-05', 'cw-06', 'cw-07', 'cw-08', 'ce-06', 'ce-07']);
  for (const p of added) {
    assert.ok(p.promo_price < p.original_price, p.id);
    assert.ok(calcDiscount(p) <= 30, `${p.id} keeps "Diskon hingga 30%" true`);
    assert.equal(p.is_new, false);
    assert.equal(p.is_featured, false);
    assert.equal(p.product_url, null);
    assert.equal(p.price_source, 'proposal');
    assert.doesNotMatch(p.name, /cotton|katun|premium|original|import|size|stok|ready/i);
  }
});

test('discount guards', () => {
  assert.equal(calcDiscount({ original_price: 100000, promo_price: 100000 }), 0);
  assert.equal(calcDiscount({ original_price: 100000, promo_price: 120000 }), 0);
  assert.equal(calcDiscount({ original_price: 0, promo_price: 0 }), 0);
  assert.equal(hasValidPromo({ original_price: NaN, promo_price: 1 }), false);
});

test('rupiah formatting', () => {
  assert.equal(formatRupiah(249000), 'Rp249.000');
  assert.equal(formatRupiah(1250000), 'Rp1.250.000');
});

test('catalog counts and featured (v4 + owner revision): 15 / new 4 / cowok 8 / cewek 7 / featured ce-01', () => {
  assert.equal(data.products.length, 15);
  assert.equal(new Set(data.products.map((p) => p.id)).size, 15);
  assert.equal(newArrivals(data.products).length, 4);
  assert.equal(byGender(data.products, 'cowok').length, 8);
  const cewek = byGender(data.products, 'cewek');
  assert.equal(cewek.length, 7);
  assert.deepEqual(data.products.filter((p) => p.is_featured).map((p) => p.id), ['ce-01']);
  assert.equal(featuredForOddGrid(cewek).id, 'ce-01');
  assert.equal(featuredForOddGrid(byGender(data.products, 'cowok')), null);
  assert.deepEqual(validateCatalog(data), []);
});

test('purchase URL: generic homepage and missing config are rejected', () => {
  assert.equal(resolvePurchaseUrl({ product_url: null }, { global_shop_url: null }), null);
  assert.equal(resolvePurchaseUrl({ product_url: null }, { global_shop_url: 'https://tokopedia.com' }), null);
  assert.equal(resolvePurchaseUrl({ product_url: null }, { global_shop_url: 'https://www.tokopedia.com/' }), null);
  assert.equal(isAllowedShopUrl('http://www.tokopedia.com/bshirt'), false);
  assert.equal(isAllowedShopUrl('https://evil.example/tokopedia.com'), false);
  assert.equal(isAllowedShopUrl('javascript:alert(1)'), false);
});

test('purchase URL: override wins and is preserved byte-for-byte', () => {
  const shop = 'https://www.tokopedia.com/example-shop?extParam=src%3Dtiktok&encode_params=a%2Bb';
  const prod = 'https://www.tokopedia.com/example-shop/item-123?utm_source=web';
  assert.equal(resolvePurchaseUrl({ product_url: null }, { global_shop_url: shop }), shop);
  assert.equal(resolvePurchaseUrl({ product_url: prod }, { global_shop_url: shop }), prod);
});

test('configured shop URL resolves for every product, unchanged', () => {
  const url = cfg.global_shop_url;
  assert.ok(url.startsWith('https://shop-id.tokopedia.com/view/product/1738719949914146085?encode_params='));
  assert.ok(url.endsWith('nUaU4o%3D'));
  for (const p of data.products) assert.equal(resolvePurchaseUrl(p, cfg), url);
});

test('global shop URL equals the owner-supplied string byte-for-byte (NEW_SHOP_URL_EXACT)', () => {
  assert.equal(cfg.global_shop_url, "https://shop-id.tokopedia.com/view/product/1738719949914146085?encode_params=MIIBPwQMVRjyj0VLvm4f044-BIIBGw11YrlluB3RqJtuWA9PhVMnv5WvnmodUvqjJNeumWwMEFcT7o_5U8N0cWa_cndbg71YCQL5BFUaaP2u6QGMMvXU6AAVkACoZgWd9mP63KwGLQhkO73SodWMOIDGrqcgYB0aUlby8eNJ4SzYhTBWZqTu07tEg-AAx5WGtA4bUfiW5P8p3vf0slHOhAet8VTw946E-KulTj9S7IYoZcoHUp3MSdLkVhQ02oZO3im4hHaiiaTrniU_8n3pZ-BHQVRNRGrSzP-e2PtEK3nlLTEu17aTmrzd_-hYVulD7pIowMBiFsWvd-Q1W7I3yp_UUVC5jQ9haBH5whd7di-PrrgRQGP2cYNlwke55KnyFJTL8fptUz-4Tev7efdxShEEEIGP1O1LWB1tPHQhenUaU4o%3D");
  assert.equal(cfg.global_shop_url.length, 511);
  for (const p of data.products) assert.equal(p.product_url, null, p.id);
});

test('every product uses a self-hosted WebP photo that exists', () => {
  for (const p of data.products) {
    assert.match(p.image, /^assets\/products\/[a-z0-9-]+-400\.webp$/, p.id);
    assert.equal(p.image_is_illustration, false, p.id);
    for (const s of p.image_sources) assert.ok(existsSync(new URL('../' + s.src, import.meta.url)), s.src);
  }
});

test('WhatsApp URL uses PRD number and encoded default message', () => {
  assert.equal(
    buildWhatsAppUrl(cfg.whatsapp),
    'https://wa.me/6282230089520?text=Halo%20Admin%20b-shirt%2C%20saya%20ingin%20bertanya%20mengenai%20produk%20di%20katalog%20web.',
  );
  assert.equal(buildWhatsAppUrl({ number: '' }), null);
});

test('tracking: payload keeps only allowed fields and pushes to dataLayer', () => {
  const fakeWin = { dataLayer: [], dispatchEvent() {} };
  const payload = track(EVENTS.SHOP_CLICK, { product_id: 'ce-01', section: 'cewek', location: 'product_card', email: 'x@y.z' }, fakeWin);
  assert.deepEqual(payload, { event: 'shop_click', product_id: 'ce-01', section: 'cewek', location: 'product_card' });
  assert.deepEqual(fakeWin.dataLayer, [payload]);
  assert.throws(() => buildEvent('purchase'));
});

test('next-open label for offline times (P3-04)', () => {
  assert.equal(nextOpenLabel(hours, wib('2026-11-23T10:00:00')), null);                 // Mon open
  assert.equal(nextOpenLabel(hours, wib('2026-11-23T06:30:00')), 'Hari ini 08.00 WIB');  // Mon early
  assert.equal(nextOpenLabel(hours, wib('2026-11-23T17:00:00')), 'Besok 08.00 WIB');     // Mon evening
  assert.equal(nextOpenLabel(hours, wib('2026-11-28T18:00:00')), 'Senin 08.00 WIB');     // Sat evening
  assert.equal(nextOpenLabel(hours, wib('2026-11-29T12:00:00')), 'Besok 08.00 WIB');     // Sunday
});

test('per-product WhatsApp question is encoded (P3-05)', () => {
  const url = buildWhatsAppUrl(cfg.whatsapp, productQuestion(data.products[0]));
  assert.ok(url.startsWith('https://wa.me/6282230089520?text='));
  assert.equal(decodeURIComponent(url.split('text=')[1]),
    'Halo Admin b-shirt, saya ingin bertanya mengenai produk "Korean Camel Oversized Coat & Turtleneck Look" di katalog web.');
  assert.ok(!url.split('text=')[1].includes('&'));
});

test('TikTok URL matches PRD', () => {
  assert.equal(cfg.tiktok_url, 'https://www.tiktok.com/@b_shirt_co');
});

test('v4: published:false hides a product everywhere without deleting its data', async () => {
  const { publishedProducts } = await import('../js/lib/catalog.js');
  const toggled = data.products.map((p) => (p.id === 'cw-03' ? { ...p, published: false } : p));
  assert.equal(publishedProducts(toggled).length, 14);
  assert.ok(!publishedProducts(toggled).some((p) => p.id === 'cw-03'));
});

test('v4: config references are validated (campaign, tiles, stage)', () => {
  const bad = { ...data, site_config: { ...cfg, campaign: { ...cfg.campaign, product_ids: ['zz-99'] } } };
  assert.ok(validateCatalog(bad).some((e) => e.includes('zz-99')));
});
