// Pure state logic for the interactive product orbit (no DOM, no WebGL) → unit-tested.
// The same model drives the WebGL ring and the 2D fallback, so both behave identically.

export const FILTERS = Object.freeze([
  { key: 'all', label: 'Semua' },
  { key: 'new', label: 'New Arrivals' },
  { key: 'cewek', label: 'Wanita' },
  { key: 'cowok', label: 'Pria' },
]);

/** Products shown in the ring for a filter key (derived from canonical data only). */
export function orbitProducts(products, filter = 'all') {
  if (filter === 'new') return products.filter((p) => p.is_new === true);
  if (filter === 'cewek' || filter === 'cowok') return products.filter((p) => p.gender === filter);
  return products.slice();
}

const TAU = Math.PI * 2;
/** Wrap an angle to (−π, π]. */
export function wrapAngle(a) {
  let x = ((a + Math.PI) % TAU + TAU) % TAU - Math.PI;
  if (x === -Math.PI) x = Math.PI;
  return x;
}

/** Angle of slot i in a ring of n (slot 0 faces the camera at ring angle 0). */
export const slotAngle = (i, n) => (n > 0 ? (i / n) * TAU : 0);

/** Ring rotation that brings slot i to the front, chosen as the shortest turn from `current`. */
export function ringTargetFor(i, n, current = 0) {
  const want = -slotAngle(i, n);
  return current + wrapAngle(want - current);
}

/** Which slot is closest to the front for a given ring rotation. */
export function frontIndex(ring, n) {
  if (n <= 0) return -1;
  const k = Math.round((-ring / TAU) * n);
  return ((k % n) + n) % n;
}

/** Next/previous index with wrap-around. */
export const stepIndex = (i, dir, n) => (n > 0 ? (((i + dir) % n) + n) % n : -1);

/**
 * Picks the card under a click. `cards` are projected card rects in CSS px
 * ({ index, x, y, w, h, depth }); depth is larger for cards nearer the camera.
 * Returns the nearest-to-camera hit, or −1.
 */
export function pickCard(cards, px, py) {
  let best = -1, bestDepth = -Infinity;
  for (const c of cards) {
    const hit = px >= c.x - c.w / 2 && px <= c.x + c.w / 2 && py >= c.y - c.h / 2 && py <= c.y + c.h / 2;
    if (hit && c.depth > bestDepth) { best = c.index; bestDepth = c.depth; }
  }
  return best;
}

/** UV crop so a photo of aspect `imgAspect` (w/h) covers a 3:4 card, honouring image_position. */
export function coverUv(imgAspect, position = 'center', cardAspect = 3 / 4) {
  if (!(imgAspect > 0)) return { u0: 0, v0: 0, u1: 1, v1: 1 };
  if (imgAspect > cardAspect) {           // image wider → crop sides
    const w = cardAspect / imgAspect, u0 = (1 - w) / 2;
    return { u0, v0: 0, u1: u0 + w, v1: 1 };
  }
  const h = imgAspect / cardAspect;       // image taller → crop top/bottom
  const v0 = position === 'top' ? 0 : (1 - h) / 2;
  return { u0: 0, v0, u1: 1, v1: v0 + h };
}
