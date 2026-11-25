import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCurvedCard, buildFloorRing } from '../js/3d/geometry.js';
import { createVerletCloth } from '../js/3d/cloth.js';
import { BG_VERT, BG_FRAG } from '../js/3d/backdrop-shader.js';
import { publishedProducts } from '../js/lib/catalog.js';
import {
  ambassadorsHtml,
  cardHtml,
  categoryTilesHtml,
  productDetailSpecs,
  orbitPanelHtml,
  orbitView,
} from '../js/lib/render.js';
import { renderModalBody } from '../js/ui/product-modal.js';
import { EVENTS, buildEvent, eventFromLink } from '../js/lib/track.js';

test('3D curved card mesh has valid normals, locals, and convex bow', () => {
  const card = buildCurvedCard(14, 2, 0.085);
  const vCount = card.positions.length / 3;
  assert.equal(vCount, 15 * 3);
  assert.equal(card.normals.length, vCount * 3);
  assert.equal(card.locals.length, vCount * 2);
  assert.ok(card.positions.every(Number.isFinite));
  assert.ok(card.indices.every((idx) => idx >= 0 && idx < vCount));
  for (let i = 0; i < card.normals.length; i += 3) {
    const len = Math.hypot(card.normals[i], card.normals[i + 1], card.normals[i + 2]);
    assert.ok(Math.abs(len - 1) < 1e-6);
  }
  const centerIdx = 7 * 3 + 2;
  const edgeIdx = 2;
  assert.ok(card.positions[centerIdx] > card.positions[edgeIdx]);
});

test('3D orbital floor ring has valid triangle strip topology', () => {
  const ring = buildFloorRing(0.95, 1.0, 72);
  const vCount = ring.positions.length / 3;
  assert.equal(vCount, 73 * 2);
  assert.equal(ring.indices.length, 72 * 6);
  assert.ok(ring.positions.every(Number.isFinite));
  assert.ok(ring.indices.every((idx) => idx >= 0 && idx < vCount));
});

test('Verlet cloth physics stays stable with pinned collar bar and unit normals', () => {
  const cloth = createVerletCloth({ width: 0.88, length: 0.96, segX: 18, segY: 28, barY: 0.28 });
  assert.equal(cloth.vertexCount, 19 * 29);
  for (let s = 0; s < 20; s += 1) {
    cloth.step(2 + s * 0.016, 10, 6, 1);
  }
  assert.ok(cloth.positions.every(Number.isFinite));
  assert.ok(cloth.normals.every(Number.isFinite));
  for (let ix = 0; ix < 19; ix += 1) {
    assert.ok(Math.abs(cloth.positions[ix * 3 + 1] - 0.28) < 1e-6);
  }
  for (let i = 0; i < cloth.normals.length; i += 3) {
    const len = Math.hypot(cloth.normals[i], cloth.normals[i + 1], cloth.normals[i + 2]);
    assert.ok(Math.abs(len - 1) < 1e-5);
  }
});

test('Atmospheric backdrop shaders obey WebGL1 / GLSL ES 1.00 rules', () => {
  assert.match(BG_VERT, /attribute vec2 aPos;/);
  assert.match(BG_FRAG, /precision mediump float;/);
  assert.match(BG_FRAG, /uniform vec3 uToneA, uToneB, uToneC;/);
  assert.doesNotMatch(BG_FRAG, /\btexture\s*\(/, 'use texture2D for WebGL1');
});

test('UI upgrade: 3D tilt attributes & ambassador rank numerals preserve brand safety', () => {
  const raw = JSON.parse(readFileSync(new URL('../catalog.json', import.meta.url), 'utf8'));
  const products = publishedProducts(raw.products);
  const amb = ambassadorsHtml(raw.site_config);
  for (const rank of ['01', '02', '03', '04']) {
    assert.ok(amb.includes(`<span class="amb__rank" aria-hidden="true">${rank}</span>`), rank);
  }
  assert.ok(amb.includes('data-tilt-card'), 'ambassador portrait supports 3D tilt');

  const card = cardHtml(products[0], raw.site_config);
  assert.ok(card.includes('data-tilt-card') && card.includes('data-product-detail="cw-01"'));

  const tiles = categoryTilesHtml(raw.site_config, products);
  assert.ok(tiles.includes('data-tilt-card'));

  const panel = orbitPanelHtml(orbitView(products[0], raw.site_config, 0, products.length));
  assert.ok(panel.includes('data-orbit-detail'));
});

test('Stage 2 extensible product specs omit missing fields and render only supplied data', () => {
  const raw = JSON.parse(readFileSync(new URL('../catalog.json', import.meta.url), 'utf8'));
  const baseProduct = raw.products[0];
  assert.deepEqual(productDetailSpecs(baseProduct), []);

  const enriched = {
    ...baseProduct,
    description: 'Potongan santai untuk aktivitas harian.',
    color: 'Camel',
    variants: ['S', 'M', 'L'],
    material: '   ',
  };
  assert.deepEqual(productDetailSpecs(enriched), [
    ['Deskripsi', 'Potongan santai untuk aktivitas harian.'],
    ['Warna', 'Camel'],
    ['Varian', 'S, M, L'],
  ]);

  const modalPlain = renderModalBody(baseProduct, raw.site_config);
  assert.ok(!modalPlain.includes('pmodal__specs'), 'no empty spec container when data missing');
  assert.ok(modalPlain.includes('Hemat Rp100.000'));
  assert.ok(modalPlain.includes(raw.site_config.global_shop_url.replaceAll('&', '&amp;')));

  const modalEnriched = renderModalBody(enriched, raw.site_config);
  assert.ok(modalEnriched.includes('pmodal__specs'));
  assert.ok(modalEnriched.includes('<dt>Warna</dt><dd>Camel</dd>'));
});

test('Stage 2 privacy-safe tracking schema supports detail_open, page_view, scene_fallback, info shop link', () => {
  assert.deepEqual(buildEvent(EVENTS.PAGE_VIEW, { location: 'catalog' }), { event: 'page_view', location: 'catalog' });
  assert.deepEqual(buildEvent(EVENTS.DETAIL_OPEN, { product_id: 'ce-01', location: 'modal' }), {
    event: 'detail_open',
    product_id: 'ce-01',
    location: 'modal',
  });
  assert.deepEqual(buildEvent(EVENTS.SCENE_FALLBACK, { location: 'webgl-unavailable' }), {
    event: 'scene_fallback',
    location: 'webgl-unavailable',
  });
  const fakeInfoLink = {
    matches: (sel) => sel === '[data-shop-info] a',
    dataset: {},
    getAttribute: () => null,
  };
  assert.deepEqual(eventFromLink(fakeInfoLink), [EVENTS.SHOP_CLICK, { location: 'info' }]);
});

test('CSS token purity: styles.css uses CSS variables only (zero raw hex/rgb/rgba literals)', () => {
  const styles = readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');
  assert.doesNotMatch(styles, /#[0-9a-fA-F]{3,8}\b/, 'no raw hex colors in styles.css');
  assert.doesNotMatch(styles, /\brgba?\s*\(/i, 'no raw rgb/rgba colors in styles.css');
});
