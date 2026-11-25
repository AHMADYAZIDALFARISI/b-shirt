import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decideSceneMode, cappedDpr } from '../js/3d/capability.js';
import { buildBrandObject, buildTube, sampleCurve, hangerPaths } from '../js/3d/geometry.js';
import { perspective, lookAt, model } from '../js/3d/mat4.js';
import { eventFromLink, buildEvent, EVENTS } from '../js/lib/track.js';

const base = { webgl: true, reducedMotion: false, saveData: false, cores: 8, memory: 8 };

test('scene mode: live on capable devices', () => {
  assert.equal(decideSceneMode(base), 'live');
});

test('scene mode: poster without WebGL, on Save-Data, or low-power hardware', () => {
  assert.equal(decideSceneMode({ ...base, webgl: false }), 'poster');
  assert.equal(decideSceneMode({ ...base, saveData: true }), 'poster');
  assert.equal(decideSceneMode({ ...base, cores: 2 }), 'poster');
  assert.equal(decideSceneMode({ ...base, memory: 2 }), 'poster');
});

test('scene mode: reduced motion renders a still frame (no animation loop)', () => {
  assert.equal(decideSceneMode({ ...base, reducedMotion: true }), 'still');
});

test('scene mode: QA override never enables WebGL where it does not exist', () => {
  assert.equal(decideSceneMode({ ...base, override: 'off' }), 'poster');
  assert.equal(decideSceneMode({ ...base, webgl: false, override: 'live' }), 'poster');
  assert.equal(decideSceneMode({ ...base, override: 'still' }), 'still');
});

test('DPR is capped (fill-rate budget)', () => {
  assert.equal(cappedDpr(3, 390), 1.5);
  assert.equal(cappedDpr(3, 1440), 1.75);
  assert.equal(cappedDpr(1, 1440), 1);
  assert.equal(cappedDpr(undefined, 390), 1);
});

test('geometry: finite buffers, valid indices, 16-bit index budget', () => {
  const { tube, ribbon } = buildBrandObject();
  for (const mesh of [tube, ribbon]) {
    assert.ok(mesh.positions.every(Number.isFinite));
    const vertices = mesh.positions.length / 3;
    assert.ok(vertices < 65536, 'fits Uint16 indices (WebGL1)');
    assert.ok(mesh.indices.every((i) => Number.isInteger(i) && i >= 0 && i < vertices));
    assert.equal(mesh.indices.length % 3, 0);
  }
  assert.ok(tube.normals.every(Number.isFinite));
  // Unit normals on the tube.
  for (let i = 0; i < tube.normals.length; i += 3) {
    assert.ok(Math.abs(Math.hypot(tube.normals[i], tube.normals[i + 1], tube.normals[i + 2]) - 1) < 1e-6);
  }
});

test('geometry: closed tube wraps, open tube does not', () => {
  const path = sampleCurve(hangerPaths().body, 4, true);
  const closed = buildTube(path, 0.02, 6, true);
  const open = buildTube(path, 0.02, 6, false);
  assert.equal(closed.indices.length - open.indices.length, 6 * 6);
});

test('matrices are finite', () => {
  for (const m of [perspective(0.5, 1.5, 0.1, 20), lookAt([0, 0, 4], [0, 0, 0]), model(0.1, 0.2, 0, 0, 0, 1)]) {
    assert.equal(m.length, 16);
    assert.ok([...m].every(Number.isFinite));
  }
});

test('tracking: collection navigation and motion toggle events', () => {
  const fake = (cls, href) => ({
    matches: (sel) => sel.split(',').some((s) => s.trim() === `.${cls}` || s.trim() === `a.${cls}`),
    getAttribute: () => href,
    dataset: {},
  });
  assert.deepEqual(eventFromLink(fake('tile', '#area-cewek')), [EVENTS.COLLECTION_NAVIGATION, { section: 'area-cewek', location: 'category_tile' }]);
  assert.deepEqual(eventFromLink(fake('nav__link', '#area-cowok')), [EVENTS.COLLECTION_NAVIGATION, { section: 'area-cowok', location: 'header' }]);
  assert.deepEqual(buildEvent('scene_interaction', { location: 'motion-off' }), { event: 'scene_interaction', location: 'motion-off' });
  // Existing events are preserved (SRS v4 FR-019).
  for (const e of ['shop_click', 'whatsapp_click', 'tiktok_click']) assert.ok(Object.values(EVENTS).includes(e), e);
});
