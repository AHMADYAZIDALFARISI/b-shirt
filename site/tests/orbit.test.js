import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  FILTERS, orbitProducts, wrapAngle, slotAngle, ringTargetFor, frontIndex, stepIndex, pickCard, coverUv,
} from '../js/3d/orbit-model.js';
import { orbitView, orbitPanelHtml, orbitChipsHtml, escapeHtml } from '../js/lib/render.js';

const data = JSON.parse(readFileSync(new URL('../catalog.json', import.meta.url), 'utf8'));
const cfg = data.site_config;
const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

test('rack filters derive from canonical data: 15 / 4 / 7 / 8', () => {
  assert.deepEqual(FILTERS.map((f) => f.key), ['all', 'new', 'cewek', 'cowok']);
  assert.equal(orbitProducts(data.products, 'all').length, 15);
  assert.equal(orbitProducts(data.products, 'new').length, 4);
  assert.equal(orbitProducts(data.products, 'cewek').length, 7);
  assert.equal(orbitProducts(data.products, 'cowok').length, 8);
  assert.equal(orbitProducts(data.products, 'unknown').length, 15);
});

test('ring maths: front slot, shortest turn, wrap-around stepping', () => {
  const n = 7;
  for (let i = 0; i < n; i += 1) assert.equal(frontIndex(ringTargetFor(i, n, 0), n), i);
  // From slot 0, going to slot 6 should turn a little backwards, not almost a full circle.
  const t = ringTargetFor(6, n, 0);
  assert.ok(Math.abs(t) < Math.PI, `short turn, got ${t}`);
  assert.ok(close(wrapAngle(3 * Math.PI), Math.PI));
  assert.ok(close(wrapAngle(-Math.PI / 2), -Math.PI / 2));
  assert.equal(stepIndex(6, 1, 7), 0);
  assert.equal(stepIndex(0, -1, 7), 6);
  assert.ok(close(slotAngle(0, 7), 0));
});

test('picking prefers the card nearest the camera', () => {
  const cards = [
    { index: 0, x: 100, y: 100, w: 80, h: 100, depth: 1 },
    { index: 1, x: 120, y: 100, w: 80, h: 100, depth: 0.3 },
  ];
  assert.equal(pickCard(cards, 110, 100), 0);
  assert.equal(pickCard(cards, 155, 100), 1);
  assert.equal(pickCard(cards, 400, 400), -1);
});

test('cover crop keeps 3:4 and honours image_position', () => {
  assert.deepEqual(coverUv(0.75), { u0: 0, v0: 0, u1: 1, v1: 1 });
  const tall = coverUv(9 / 16, 'top');
  assert.ok(close(tall.v0, 0) && tall.v1 < 1 && close(tall.u1 - tall.u0, 1));
  const tallC = coverUv(9 / 16, 'center');
  assert.ok(tallC.v0 > 0 && close(tallC.v0, 1 - tallC.v1));
  const wide = coverUv(1, 'center');
  assert.ok(wide.u0 > 0 && close(wide.v1 - wide.v0, 1));
});

test('orbit panel: exact purchase URL, prices, collection anchor', () => {
  const ce01 = data.products.find((p) => p.id === 'ce-01');
  const v = orbitView(ce01, cfg, 2, 7);
  assert.equal(v.buyUrl, cfg.global_shop_url);
  assert.equal(v.priceNow, 'Rp189.000');
  assert.equal(v.priceWas, 'Rp269.000');
  assert.equal(v.discount, '-30%');
  assert.equal(v.seeHref, '#area-cewek');
  assert.equal(v.counter, '3 / 7');
  const html = orbitPanelHtml(v);
  assert.ok(html.includes(`href="${escapeHtml(cfg.global_shop_url)}"`));
  assert.ok(html.includes('target="_blank" rel="noopener noreferrer"'));
  assert.ok(html.includes('data-section="orbit"'));
});

test('orbit panel escapes data and disables buying without a valid URL', () => {
  const evil = { ...data.products[0], name: '<img src=x onerror=1>' };
  assert.ok(!orbitPanelHtml(orbitView(evil, cfg, 0, 1)).includes('<img src=x'));
  const noUrl = orbitPanelHtml(orbitView(data.products[0], { ...cfg, global_shop_url: 'https://tokopedia.com' }, 0, 1));
  assert.ok(noUrl.includes('buy--disabled'));
});

test('filter chips expose pressed state', () => {
  const html = orbitChipsHtml(FILTERS, 'cewek');
  assert.ok(html.includes('data-orbit-filter="cewek" aria-pressed="true"'));
  assert.ok(html.includes('data-orbit-filter="all" aria-pressed="false"'));
});
