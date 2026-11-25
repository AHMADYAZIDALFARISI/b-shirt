// Decides whether the decorative 3D scene runs. Pure function → unit-tested.
// Returns 'live' (animated), 'still' (render one static frame, no loop) or 'poster' (no WebGL at all).

/**
 * @param {object} env
 * @param {boolean} env.webgl            WebGL context can be created
 * @param {boolean} env.reducedMotion    prefers-reduced-motion: reduce
 * @param {boolean} [env.saveData]       navigator.connection.saveData
 * @param {number}  [env.cores]          navigator.hardwareConcurrency
 * @param {number}  [env.memory]         navigator.deviceMemory (GB)
 * @param {string}  [env.override]       '?scene=' query value: 'off' | 'still' | 'live'
 */
export function decideSceneMode({ webgl, reducedMotion, saveData = false, cores, memory, override } = {}) {
  if (override === 'off') return 'poster';
  if (!webgl) return 'poster';
  if (override === 'still') return 'still';
  if (override === 'live') return 'live';
  // Low-power or data-saving devices keep the official logo poster: no GPU work, no extra bytes.
  if (saveData) return 'poster';
  if (Number.isFinite(cores) && cores <= 2) return 'poster';
  if (Number.isFinite(memory) && memory <= 2) return 'poster';
  // Reduced motion: show the object, but as a single still frame.
  if (reducedMotion) return 'still';
  return 'live';
}

/** Probe WebGL support without keeping the context alive. */
export function probeWebGL(doc = globalThis.document) {
  try {
    const canvas = doc.createElement('canvas');
    const gl = canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })
      || canvas.getContext('experimental-webgl');
    const ok = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

/** Device pixel ratio cap: sharp enough on phones without paying for 3x retina fill-rate. */
export function cappedDpr(dpr = 1, width = 1024) {
  const cap = width < 640 ? 1.5 : 1.75;
  return Math.min(Math.max(dpr || 1, 1), cap);
}
