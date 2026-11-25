// "Garis b-shirt" — decorative WebGL1 scene: one-line hanger tube + draped fabric ribbon.
// Raw WebGL (no library, see DECISIONS D2). Lifecycle: mount → start/stop (visibility) → destroy.
// The canvas is aria-hidden; every action on the page is an HTML control.
import { buildBrandObject } from './geometry.js';
import { perspective, lookAt, model } from './mat4.js';

export const VERT = `
attribute vec3 aPos;
attribute vec3 aNormal;
attribute vec2 aUv;
uniform mat4 uProj, uView, uModel;
uniform float uTime, uMotion;
// Shared with the fragment shader: precision must match exactly or WebGL refuses to link.
uniform mediump float uRibbon;
varying vec3 vNormal, vWorld;
varying vec2 vUv;
void main() {
  vec3 p = aPos;
  vec3 n = aNormal;
  if (uRibbon > 0.5) {
    // Soft drape: amplitude grows toward the hem (v=1), slow travelling wave + gentle sway.
    float v = aUv.y, u = aUv.x;
    float amp = 0.055 * v * v;
    float ph = v * 5.0 - uTime * 1.1 + u * 1.6;
    float d = (sin(ph) + 0.35 * sin(ph * 1.9 + 1.3)) * amp * uMotion;
    // Static vertical folds that deepen toward the hem: this is what makes it read as cloth.
    float fa = 0.045 * (0.25 + v);
    float fp = u * 6.2831 * 2.5 + 0.6;
    float fold = sin(fp) * fa + 0.35 * sin(fp * 2.1 + 1.7) * fa;
    p.z += d + fold;
    p.x += sin(uTime * 0.7 + v * 2.0) * 0.02 * v * uMotion;
    // Analytic normal of the displaced sheet (displacement along +z).
    float ddv = (cos(ph) * 5.0 + 0.35 * cos(ph * 1.9 + 1.3) * 9.5) * amp * uMotion + 2.0 * 0.055 * v * sin(ph) * uMotion
              + 0.045 * (sin(fp) + 0.35 * sin(fp * 2.1 + 1.7));
    float ddu = (cos(ph) * 1.6 + 0.35 * cos(ph * 1.9 + 1.3) * 3.04) * amp * uMotion
              + fa * 15.708 * (cos(fp) + 0.735 * cos(fp * 2.1 + 1.7));
    n = normalize(vec3(-ddu / 1.04, ddv / 1.15, 1.0));
  }
  vec4 world = uModel * vec4(p, 1.0);
  vWorld = world.xyz;
  vNormal = (uModel * vec4(n, 0.0)).xyz;   // GLSL ES 1.00: no mat3(mat4) constructor
  vUv = aUv;
  gl_Position = uProj * uView * world;
}`;

export const FRAG = `
precision mediump float;
uniform vec3 uBase, uEye;
uniform mediump float uRibbon;
uniform float uSheen;
varying vec3 vNormal, vWorld;
varying vec2 vUv;
void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(uEye - vWorld);
  if (dot(N, V) < 0.0) N = -N;                       // double-sided fabric
  vec3 key = normalize(vec3(0.55, 0.75, 0.65));
  vec3 fill = normalize(vec3(-0.7, 0.15, 0.45));
  vec3 rimDir = normalize(vec3(0.0, 0.4, -1.0));
  float dk = max(dot(N, key), 0.0);
  float df = max(dot(N, fill), 0.0);
  float wrap = (dot(N, key) + 0.45) / 1.45;          // soft wrap lighting for cloth
  float diffuse = uRibbon > 0.5 ? max(wrap, 0.0) : dk;
  vec3 H = normalize(key + V);
  float rough = uRibbon > 0.5 ? 18.0 : 48.0;          // fabric is broad and soft; the hanger slightly glossier
  float spec = pow(max(dot(N, H), 0.0), rough) * (uRibbon > 0.5 ? 0.06 : 0.28);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  float rim = fres * (0.25 + 0.35 * max(dot(-rimDir, V), 0.0));
  vec3 warm = vec3(1.0, 0.97, 0.92), cool = vec3(0.86, 0.9, 0.97);
  vec3 col = uBase * (0.34 + 0.78 * diffuse * warm + 0.22 * df * cool);
  col += spec * warm + rim * mix(vec3(1.0), uBase, 0.4) * 0.6;
  if (uRibbon > 0.5) {
    col *= 0.92 + 0.08 * smoothstep(0.0, 0.15, vUv.y);       // contact shade under the bar
    col += uSheen * fres * 0.12;                              // faint fabric sheen
  }
  gl_FragColor = vec4(pow(col, vec3(1.0 / 1.1)), 1.0);
}`;

export function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader compile failed');
  return s;
}

export const hexToRgb = (hex) => {
  const h = String(hex).trim().replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.padEnd(6, '0');
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ animate: boolean, colors: Record<string,string>, dpr: number, onLost?: () => void }} opts
 */
export function mountScene(canvas, { animate, colors, dpr, onLost }) {
  const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' });
  if (!gl) throw new Error('WebGL unavailable');

  let program, buffers, raf = 0, running = false, destroyed = false;
  let time = 0, last = 0, motion = animate ? 1 : 0;
  // Pointer target (−1..1) and smoothed rotation.
  const target = { x: 0, y: 0 }, rot = { x: 0, y: 0 };
  const accent = { current: hexToRgb(colors.new), goal: hexToRgb(colors.new) };
  const tubeColor = hexToRgb(colors.line);

  function init() {
    const vs = compile(gl, gl.VERTEX_SHADER, VERT), fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    program = gl.createProgram();
    gl.attachShader(program, vs); gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`program link failed: ${gl.getProgramInfoLog(program)}`);
    const { tube, ribbon } = buildBrandObject();
    const mk = (target, data, Type) => { const b = gl.createBuffer(); gl.bindBuffer(target, b); gl.bufferData(target, new Type(data), gl.STATIC_DRAW); return b; };
    const zeros2 = new Array((tube.positions.length / 3) * 2).fill(0);
    const ribbonNormals = new Array(ribbon.positions.length).fill(0).map((_, i) => (i % 3 === 2 ? 1 : 0));
    buffers = {
      tube: { pos: mk(gl.ARRAY_BUFFER, tube.positions, Float32Array), nrm: mk(gl.ARRAY_BUFFER, tube.normals, Float32Array), uv: mk(gl.ARRAY_BUFFER, zeros2, Float32Array), idx: mk(gl.ELEMENT_ARRAY_BUFFER, tube.indices, Uint16Array), count: tube.indices.length },
      ribbon: { pos: mk(gl.ARRAY_BUFFER, ribbon.positions, Float32Array), nrm: mk(gl.ARRAY_BUFFER, ribbonNormals, Float32Array), uv: mk(gl.ARRAY_BUFFER, ribbon.uvs, Float32Array), idx: mk(gl.ELEMENT_ARRAY_BUFFER, ribbon.indices, Uint16Array), count: ribbon.indices.length },
    };
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);
  }

  function resize() {
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function bind(mesh, loc) {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.pos); gl.vertexAttribPointer(loc.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.nrm); gl.vertexAttribPointer(loc.aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uv); gl.vertexAttribPointer(loc.aUv, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.idx);
  }

  function draw() {
    resize();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    const L = (n) => gl.getAttribLocation(program, n), U = (n) => gl.getUniformLocation(program, n);
    const loc = { aPos: L('aPos'), aNormal: L('aNormal'), aUv: L('aUv') };
    [loc.aPos, loc.aNormal, loc.aUv].forEach((l) => gl.enableVertexAttribArray(l));
    const aspect = canvas.width / canvas.height;
    const eye = [0, 0.15, 4.2];
    // Fit the object (≈2.0 wide × 2.3 tall) into narrow and wide boxes alike.
    // Visible height at this distance/FOV is ≈2.25 units; the object is ≈2.3 tall, so keep it at
    // ~70% of the frame height (and narrower than the frame on tall/narrow boxes).
    const scale = 0.7 * Math.min(1, aspect / 1.1);
    gl.uniformMatrix4fv(U('uProj'), false, perspective(0.52, aspect, 0.1, 20));
    gl.uniformMatrix4fv(U('uView'), false, lookAt(eye, [0, -0.08, 0]));
    const idle = Math.sin(time * 0.35) * 0.32 * motion;
    gl.uniformMatrix4fv(U('uModel'), false, model(rot.x * 0.25 + 0.04, idle + rot.y * 0.6, 0, -0.02, 0, scale));
    gl.uniform3fv(U('uEye'), eye);
    gl.uniform1f(U('uTime'), time);
    gl.uniform1f(U('uMotion'), Math.max(motion, 0.35)); // a still frame keeps a natural drape
    gl.uniform1f(U('uSheen'), 1);

    gl.uniform1f(U('uRibbon'), 0);
    gl.uniform3fv(U('uBase'), tubeColor);
    bind(buffers.tube, loc);
    gl.drawElements(gl.TRIANGLES, buffers.tube.count, gl.UNSIGNED_SHORT, 0);

    gl.uniform1f(U('uRibbon'), 1);
    gl.uniform3fv(U('uBase'), accent.current);
    bind(buffers.ribbon, loc);
    gl.drawElements(gl.TRIANGLES, buffers.ribbon.count, gl.UNSIGNED_SHORT, 0);
  }

  function frame(now) {
    if (!running || destroyed) return;
    const dt = Math.min((now - (last || now)) / 1000, 0.05);
    last = now;
    time += dt * motion;
    // Critically damped easing toward pointer target and accent colour (≈200 ms feel).
    const k = 1 - Math.exp(-dt * 6);
    rot.x += (target.y - rot.x) * k;
    rot.y += (target.x - rot.y) * k;
    accent.current = accent.current.map((c, i) => c + (accent.goal[i] - c) * (1 - Math.exp(-dt * 8)));
    draw();
    raf = requestAnimationFrame(frame);
  }

  function onLostEvt(e) { e.preventDefault(); stop(); onLost?.(); }
  function onRestored() { try { init(); draw(); } catch { onLost?.(); } }
  canvas.addEventListener('webglcontextlost', onLostEvt);
  canvas.addEventListener('webglcontextrestored', onRestored);

  function start() { if (running || destroyed) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  init();
  draw();

  return {
    start, stop,
    /** Animate or freeze; when frozen we still draw one frame so the object is visible. */
    setMotion(on) { motion = on ? 1 : 0; if (!on) draw(); },
    /** Pointer target in −1..1 (cosmetic tilt). */
    setPointer(x, y) { target.x = Math.max(-1, Math.min(1, x)); target.y = Math.max(-1, Math.min(1, y)); if (!running) { rot.x = target.y; rot.y = target.x; draw(); } },
    /** Ribbon colour follows the focused collection node (new / women / men). */
    setAccent(key) { accent.goal = hexToRgb(colors[key] || colors.new); if (!running) { accent.current = accent.goal; draw(); } },
    redraw: draw,
    destroy() {
      destroyed = true; stop();
      canvas.removeEventListener('webglcontextlost', onLostEvt);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      if (buffers) Object.values(buffers).forEach((m) => [m.pos, m.nrm, m.uv, m.idx].forEach((b) => gl.deleteBuffer(b)));
      if (program) gl.deleteProgram(program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
