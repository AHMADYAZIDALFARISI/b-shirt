// Upgraded unified WebGL1 3D Atelier Stage for b-shirt.
// Combines four cohesive passes in one WebGL context (TikTok WebView safe):
// 1. Atmospheric studio shader backdrop (Paper Shaders Mesh/Grain/GodRays + ReactBits Silk).
// 2. Grounded studio pedestal & dual orbital rings.
// 3. Centerpiece 3D b-shirt continuous-line sculpture + live Verlet woven atelier cloth (ThreeUI).
// 4. Curved cylindrical 3D product cards with SDF rounded borders, linen backs, and liquid-metal focus rim.

import { buildBrandObject, buildCurvedCard, buildFloorRing } from './geometry.js';
import { createVerletCloth, buildWovenClothCanvas } from './cloth.js';
import { BG_VERT, BG_FRAG } from './backdrop-shader.js';
import { perspective, lookAt, model } from './mat4.js';
import { compile, hexToRgb } from './scene.js';
import {
  wrapAngle,
  slotAngle,
  ringTargetFor,
  frontIndex,
  stepIndex,
  pickCard,
  coverUv,
} from './orbit-model.js';

const TUBE_VERT = `
precision mediump float;
attribute vec3 aPos, aNorm;
uniform mat4 uMvp, uModel;
varying vec3 vNorm, vWorld;
void main() {
  vec4 world = uModel * vec4(aPos, 1.0);
  vWorld = world.xyz;
  vNorm = normalize(mat3(uModel[0].xyz, uModel[1].xyz, uModel[2].xyz) * aNorm);
  gl_Position = uMvp * vec4(aPos, 1.0);
}`;

const TUBE_FRAG = `
precision mediump float;
uniform vec3 uColor, uMetalRim, uEye, uPointer3;
varying vec3 vNorm, vWorld;
void main() {
  vec3 N = normalize(vNorm);
  vec3 V = normalize(uEye - vWorld);
  vec3 L1 = normalize(vec3(1.8 + uPointer3.x * 1.4, 2.4 + uPointer3.y * 0.8, 2.6));
  vec3 L2 = normalize(vec3(-2.1, -0.9, 1.5));
  float diff = max(dot(N, L1), 0.0) * 0.72 + max(dot(N, L2), 0.0) * 0.28 + 0.16;
  vec3 H = normalize(L1 + V);
  float spec = pow(max(dot(N, H), 0.0), 42.0);
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.8);
  vec3 base = uColor * diff;
  vec3 brushed = mix(base, uMetalRim, fresnel * 0.62) + uMetalRim * spec * 0.55;
  gl_FragColor = vec4(clamp(brushed, 0.0, 1.0), 1.0);
}`;

const CLOTH_VERT = `
precision mediump float;
attribute vec3 aPos, aNorm;
attribute vec2 aUv;
uniform mat4 uMvp, uModel;
varying vec3 vNorm, vWorld;
varying vec2 vUv;
void main() {
  vec4 world = uModel * vec4(aPos, 1.0);
  vWorld = world.xyz;
  vNorm = normalize(mat3(uModel[0].xyz, uModel[1].xyz, uModel[2].xyz) * aNorm);
  vUv = aUv;
  gl_Position = uMvp * vec4(aPos, 1.0);
}`;

const CLOTH_FRAG = `
precision mediump float;
uniform sampler2D uWeaveTex;
uniform vec3 uColor, uMetalRim, uEye, uPointer3;
uniform float uTime, uMotion;
varying vec3 vNorm, vWorld;
varying vec2 vUv;
void main() {
  vec3 N = normalize(vNorm) * (gl_FrontFacing ? 1.0 : -1.0);
  vec3 V = normalize(uEye - vWorld);
  vec3 L = normalize(vec3(1.6 + uPointer3.x * 1.1, 2.2, 2.5));
  float wrapDiff = max(dot(N, L) * 0.5 + 0.5, 0.0);
  float sheen = pow(1.0 - max(dot(N, V), 0.0), 2.4);
  vec3 weave = texture2D(uWeaveTex, vUv).rgb;
  // Blend linen weave detail with collection tone & subtle iridescent silk shift (ThreeUI inspired)
  vec3 silk = mix(uColor, uMetalRim, 0.25 + 0.15 * sin(vUv.y * 6.0 - uTime * 0.8 * uMotion));
  vec3 col = weave * mix(uColor * 0.88, silk * 1.08, wrapDiff * 0.72) + uMetalRim * sheen * 0.22;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 0.94);
}`;

const FLOOR_VERT = `
precision mediump float;
attribute vec3 aPos;
attribute vec2 aUv;
uniform mat4 uMvp;
varying vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = uMvp * vec4(aPos, 1.0);
}`;

const FLOOR_FRAG = `
precision mediump float;
uniform vec3 uColor, uMetalRim;
uniform float uAlpha;
varying vec2 vUv;
void main() {
  float radial = sin(vUv.y * 3.14159265);
  float angleFade = 0.55 + 0.45 * cos(vUv.x * 6.2831853);
  vec3 col = mix(uColor, uMetalRim, angleFade * 0.5);
  gl_FragColor = vec4(col, radial * uAlpha);
}`;

const CARD_VERT = `
precision mediump float;
attribute vec3 aPos, aNorm;
attribute vec2 aLocal;
uniform mat4 uMvp, uModel;
varying vec2 vLocal;
varying vec3 vNorm, vWorld;
void main() {
  vec4 world = uModel * vec4(aPos, 1.0);
  vWorld = world.xyz;
  vNorm = normalize(mat3(uModel[0].xyz, uModel[1].xyz, uModel[2].xyz) * aNorm);
  vLocal = aLocal;
  gl_Position = uMvp * vec4(aPos, 1.0);
}`;

const CARD_FRAG = `
precision mediump float;
uniform sampler2D uTex, uBackTex;
uniform vec4 uUvRect;
uniform vec3 uBack, uRim, uEye, uFogColor;
uniform float uFocus, uTime, uMotion, uDepthFade;
varying vec2 vLocal;
varying vec3 vNorm, vWorld;

float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + vec2(r);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  // Flip Y so UV 0,0 sits at top-left for upright product textures
  vec2 p = vLocal - 0.5;
  float dist = sdRoundRect(p, vec2(0.5, 0.5), 0.052);
  float alpha = 1.0 - smoothstep(-0.008, 0.008, dist);
  if (alpha < 0.04) discard;

  vec3 N = normalize(vNorm) * (gl_FrontFacing ? 1.0 : -1.0);
  vec3 V = normalize(uEye - vWorld);
  vec3 L = normalize(vec3(1.2, 1.8, 2.8));
  float shade = mix(0.84, 1.04, max(dot(N, L) * 0.5 + 0.5, 0.0));

  vec3 col;
  if (gl_FrontFacing) {
    vec2 suv = vec2(vLocal.x, 1.0 - vLocal.y);
    vec2 uv = mix(uUvRect.xy, uUvRect.zw, suv);
    col = texture2D(uTex, uv).rgb * shade;
    // Subtle curved-glass specular sweep across product print
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.4);
    col += vec3(0.98, 0.96, 0.92) * fres * (0.10 + 0.14 * uFocus);
  } else {
    vec3 linen = texture2D(uBackTex, vec2(1.0 - vLocal.x, 1.0 - vLocal.y)).rgb;
    col = linen * mix(uBack, uBack * 1.12 + vec3(0.08), 0.35) * shade;
  }

  // Unicorn/Liquid-Metal traveling rim sweep on card perimeter (amplified for active card)
  float edgeBand = smoothstep(-0.026, -0.004, dist) * (1.0 - smoothstep(-0.004, 0.008, dist));
  float sweep = 0.5 + 0.5 * sin(atan(p.y, p.x) * 2.0 - uTime * (1.6 * uMotion + 0.01) + 0.8);
  vec3 rimCol = mix(uBack * 1.35 + vec3(0.18), uRim * 1.18 + vec3(0.24), sweep * uFocus);
  col = mix(col, rimCol, edgeBand * mix(0.32, 0.85, uFocus));

  // Subtle atmospheric depth separation for far orbit cards
  col = mix(col, uFogColor, uDepthFade * 0.36);

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), alpha);
}`;

const ORBIT_RADIUS = 1.88;
const CARD_W = 0.64;
const CARD_H = 0.85;

const TONE_PALETTES = {
  all: {
    a: [0.953, 0.937, 0.914], // warm limestone
    b: [0.918, 0.867, 0.808], // soft linen sand
    c: [0.886, 0.824, 0.788], // warm stone blush
    fog: [0.935, 0.910, 0.878],
  },
  new: {
    a: [0.945, 0.925, 0.890],
    b: [0.925, 0.840, 0.745], // warm champagne-terracotta
    c: [0.890, 0.845, 0.790],
    fog: [0.932, 0.900, 0.855],
  },
  cewek: {
    a: [0.960, 0.929, 0.916],
    b: [0.922, 0.816, 0.784], // dusty editorial rose
    c: [0.898, 0.855, 0.832],
    fog: [0.942, 0.906, 0.890],
  },
  cowok: {
    a: [0.930, 0.935, 0.938],
    b: [0.835, 0.855, 0.865], // mineral slate mist
    c: [0.890, 0.878, 0.855],
    fog: [0.905, 0.914, 0.918],
  },
};

function createProgram(gl, vsSrc, fsSrc) {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return null;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

function makeSolidTexture(gl, r, g, b) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([r, g, b, 255]),
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

function makeCanvasTexture(gl, sourceCanvas) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCanvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

function makeStaticBuffer(gl, target, TypedArray, data) {
  const buf = gl.createBuffer();
  gl.bindBuffer(target, buf);
  gl.bufferData(target, new TypedArray(data), gl.STATIC_DRAW);
  return buf;
}

function bindAttrib(gl, loc, buf, size) {
  if (loc < 0) return;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
}

function mul4(a, b) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c += 1) {
    for (let r = 0; r < 4; r += 1) {
      o[c * 4 + r] =
        a[r] * b[c * 4] +
        a[4 + r] * b[c * 4 + 1] +
        a[8 + r] * b[c * 4 + 2] +
        a[12 + r] * b[c * 4 + 3];
    }
  }
  return o;
}

function projectPoint(mvp, x, y, z, w, h) {
  const cx = mvp[0] * x + mvp[4] * y + mvp[8] * z + mvp[12];
  const cy = mvp[1] * x + mvp[5] * y + mvp[9] * z + mvp[13];
  const cw = mvp[3] * x + mvp[7] * y + mvp[11] * z + mvp[15];
  if (cw <= 0.001) return null;
  return [(cx / cw * 0.5 + 0.5) * w, (0.5 - (cy / cw) * 0.5) * h, cw];
}

function mix3(out, target, factor) {
  out[0] += (target[0] - out[0]) * factor;
  out[1] += (target[1] - out[1]) * factor;
  out[2] += (target[2] - out[2]) * factor;
}

/**
 * Mounts the unified interactive 3D orbit scene on `canvas`.
 */
export function mountOrbit(canvas, { colors = {}, dpr = 1.5, animate = true, quality = 'high', onSelect, onLost } = {}) {
  const gl =
    canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'high-performance' }) ||
    canvas.getContext('experimental-webgl', { alpha: true, antialias: true });
  if (!gl) return null;

  const pBg = createProgram(gl, BG_VERT, BG_FRAG);
  const pTube = createProgram(gl, TUBE_VERT, TUBE_FRAG);
  const pCloth = createProgram(gl, CLOTH_VERT, CLOTH_FRAG);
  const pFloor = createProgram(gl, FLOOR_VERT, FLOOR_FRAG);
  const pCard = createProgram(gl, CARD_VERT, CARD_FRAG);
  if (!pBg || !pTube || !pCloth || !pFloor || !pCard) {
    [pBg, pTube, pCloth, pFloor, pCard].forEach((p) => p && gl.deleteProgram(p));
    return null;
  }

  // Static geometry
  const bgBuf = makeStaticBuffer(gl, gl.ARRAY_BUFFER, Float32Array, [-1, -1, 1, -1, -1, 1, 1, 1]);
  const { tube } = buildBrandObject();
  const tubePosBuf = makeStaticBuffer(gl, gl.ARRAY_BUFFER, Float32Array, tube.positions);
  const tubeNormBuf = makeStaticBuffer(gl, gl.ARRAY_BUFFER, Float32Array, tube.normals);
  const tubeIdxBuf = makeStaticBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, Uint16Array, tube.indices);

  const cardMesh = buildCurvedCard(14, 2, 0.085);
  const cardPosBuf = makeStaticBuffer(gl, gl.ARRAY_BUFFER, Float32Array, cardMesh.positions);
  const cardNormBuf = makeStaticBuffer(gl, gl.ARRAY_BUFFER, Float32Array, cardMesh.normals);
  const cardLocalBuf = makeStaticBuffer(gl, gl.ARRAY_BUFFER, Float32Array, cardMesh.locals);
  const cardIdxBuf = makeStaticBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, Uint16Array, cardMesh.indices);

  const floorMesh = buildFloorRing(0.955, 1.0, 72);
  const floorPosBuf = makeStaticBuffer(gl, gl.ARRAY_BUFFER, Float32Array, floorMesh.positions);
  const floorUvBuf = makeStaticBuffer(gl, gl.ARRAY_BUFFER, Float32Array, floorMesh.uvs);
  const floorIdxBuf = makeStaticBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, Uint16Array, floorMesh.indices);

  // Dynamic Verlet Cloth buffers
  const cloth = createVerletCloth({ width: 0.88, length: 0.96, segX: 18, segY: 28, barY: 0.28 });
  const clothPosBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, clothPosBuf);
  gl.bufferData(gl.ARRAY_BUFFER, cloth.positions, gl.DYNAMIC_DRAW);

  const clothNormBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, clothNormBuf);
  gl.bufferData(gl.ARRAY_BUFFER, cloth.normals, gl.DYNAMIC_DRAW);

  const clothUvBuf = makeStaticBuffer(gl, gl.ARRAY_BUFFER, Float32Array, cloth.uvs);
  const clothIdxBuf = makeStaticBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, Uint16Array, cloth.indices);

  // Textures
  const fallbackTex = makeSolidTexture(gl, 240, 234, 226);
  const weaveCanvas = buildWovenClothCanvas();
  const weaveTex = makeCanvasTexture(gl, weaveCanvas);
  const texCache = new Map();

  // Attribute & Uniform locations
  const loc = {
    bg: {
      aPos: gl.getAttribLocation(pBg, 'aPos'),
      uRes: gl.getUniformLocation(pBg, 'uRes'),
      uPointer: gl.getUniformLocation(pBg, 'uPointer'),
      uTime: gl.getUniformLocation(pBg, 'uTime'),
      uMotion: gl.getUniformLocation(pBg, 'uMotion'),
      uToneA: gl.getUniformLocation(pBg, 'uToneA'),
      uToneB: gl.getUniformLocation(pBg, 'uToneB'),
      uToneC: gl.getUniformLocation(pBg, 'uToneC'),
    },
    tube: {
      aPos: gl.getAttribLocation(pTube, 'aPos'),
      aNorm: gl.getAttribLocation(pTube, 'aNorm'),
      uMvp: gl.getUniformLocation(pTube, 'uMvp'),
      uModel: gl.getUniformLocation(pTube, 'uModel'),
      uColor: gl.getUniformLocation(pTube, 'uColor'),
      uMetalRim: gl.getUniformLocation(pTube, 'uMetalRim'),
      uEye: gl.getUniformLocation(pTube, 'uEye'),
      uPointer3: gl.getUniformLocation(pTube, 'uPointer3'),
    },
    cloth: {
      aPos: gl.getAttribLocation(pCloth, 'aPos'),
      aNorm: gl.getAttribLocation(pCloth, 'aNorm'),
      aUv: gl.getAttribLocation(pCloth, 'aUv'),
      uMvp: gl.getUniformLocation(pCloth, 'uMvp'),
      uModel: gl.getUniformLocation(pCloth, 'uModel'),
      uWeaveTex: gl.getUniformLocation(pCloth, 'uWeaveTex'),
      uColor: gl.getUniformLocation(pCloth, 'uColor'),
      uMetalRim: gl.getUniformLocation(pCloth, 'uMetalRim'),
      uEye: gl.getUniformLocation(pCloth, 'uEye'),
      uPointer3: gl.getUniformLocation(pCloth, 'uPointer3'),
      uTime: gl.getUniformLocation(pCloth, 'uTime'),
      uMotion: gl.getUniformLocation(pCloth, 'uMotion'),
    },
    floor: {
      aPos: gl.getAttribLocation(pFloor, 'aPos'),
      aUv: gl.getAttribLocation(pFloor, 'aUv'),
      uMvp: gl.getUniformLocation(pFloor, 'uMvp'),
      uColor: gl.getUniformLocation(pFloor, 'uColor'),
      uMetalRim: gl.getUniformLocation(pFloor, 'uMetalRim'),
      uAlpha: gl.getUniformLocation(pFloor, 'uAlpha'),
    },
    card: {
      aPos: gl.getAttribLocation(pCard, 'aPos'),
      aNorm: gl.getAttribLocation(pCard, 'aNorm'),
      aLocal: gl.getAttribLocation(pCard, 'aLocal'),
      uMvp: gl.getUniformLocation(pCard, 'uMvp'),
      uModel: gl.getUniformLocation(pCard, 'uModel'),
      uTex: gl.getUniformLocation(pCard, 'uTex'),
      uBackTex: gl.getUniformLocation(pCard, 'uBackTex'),
      uUvRect: gl.getUniformLocation(pCard, 'uUvRect'),
      uBack: gl.getUniformLocation(pCard, 'uBack'),
      uRim: gl.getUniformLocation(pCard, 'uRim'),
      uEye: gl.getUniformLocation(pCard, 'uEye'),
      uFogColor: gl.getUniformLocation(pCard, 'uFogColor'),
      uFocus: gl.getUniformLocation(pCard, 'uFocus'),
      uTime: gl.getUniformLocation(pCard, 'uTime'),
      uMotion: gl.getUniformLocation(pCard, 'uMotion'),
      uDepthFade: gl.getUniformLocation(pCard, 'uDepthFade'),
    },
  };

  // Colors & mutable state
  const colLine = hexToRgb(colors.line || '#1f1d1a');
  const colBack = hexToRgb(colors.cardBack || '#d8cec1');
  const colRim = hexToRgb(colors.rim || '#c89b6e');
  const colFabric = {
    all: hexToRgb(colors.fabric || '#c9b8a3'),
    new: hexToRgb(colors.rim || '#c89b6e'),
    women: hexToRgb(colors.women || '#a87464'),
    men: hexToRgb(colors.men || '#5a6e76'),
  };

  let items = [];
  let selected = 0;
  let ring = 0;
  let targetRing = 0;
  let velRing = 0;
  let pointer = [0, 0];
  let pointerTarget = [0, 0];
  let motion = animate ? 1 : 0;
  let targetToneKey = 'all';
  const curTone = {
    a: [...TONE_PALETTES.all.a],
    b: [...TONE_PALETTES.all.b],
    c: [...TONE_PALETTES.all.c],
    fog: [...TONE_PALETTES.all.fog],
    fabric: [...colFabric.all],
  };

  let cw = 1, ch = 1;
  let lastBoxes = [];
  let rafId = 0;
  let running = false;
  let destroyed = false;
  let t0 = performance.now();
  let lastFrame = t0;
  let dirtyStill = true;
  let clothFrame = 0;
  const clothStride = quality === 'medium' ? 2 : 1;

  function loadTex(src) {
    if (!src) return fallbackTex;
    if (texCache.has(src)) return texCache.get(src).tex;
    const entry = { tex: makeSolidTexture(gl, 240, 234, 226), aspect: 3 / 4, ready: false };
    texCache.set(src, entry);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      if (destroyed) return;
      gl.bindTexture(gl.TEXTURE_2D, entry.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      entry.aspect = (img.naturalWidth || 3) / (img.naturalHeight || 4);
      entry.ready = true;
      dirtyStill = true;
      if (!motion && !running) renderNow(performance.now());
    };
    img.src = src;
    return entry.tex;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(2, Math.max(1, dpr));
    const nw = Math.max(1, Math.round(rect.width * scale));
    const nh = Math.max(1, Math.round(rect.height * scale));
    if (nw !== canvas.width || nh !== canvas.height) {
      canvas.width = nw;
      canvas.height = nh;
      cw = rect.width || 1;
      ch = rect.height || 1;
      gl.viewport(0, 0, nw, nh);
      dirtyStill = true;
      if (!motion) renderNow(performance.now());
    }
  }

  function targetFabric() {
    const active = items[selected];
    if (active && colFabric[active.accent]) return colFabric[active.accent];
    return colFabric[targetToneKey] || colFabric.all;
  }

  function renderNow(now) {
    if (destroyed) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - lastFrame) / 1000));
    lastFrame = now;
    const t = (now - t0) / 1000;

    // Smooth camera pointer damping
    pointer[0] += (pointerTarget[0] - pointer[0]) * Math.min(1, dt * 8);
    pointer[1] += (pointerTarget[1] - pointer[1]) * Math.min(1, dt * 8);

    // Smooth atmospheric palette & cloth tinting
    const pal = TONE_PALETTES[targetToneKey] || TONE_PALETTES.all;
    const tRate = Math.min(1, dt * 5);
    mix3(curTone.a, pal.a, tRate);
    mix3(curTone.b, pal.b, tRate);
    mix3(curTone.c, pal.c, tRate);
    mix3(curTone.fog, pal.fog, tRate);
    mix3(curTone.fabric, targetFabric(), tRate);

    // Spring orbit ring toward target
    if (!dragging) {
      const diff = wrapAngle(targetRing - ring);
      ring += diff * (motion ? Math.min(1, dt * 9.5) : 1);
      velRing *= 0.84;
    }

    // Step Verlet cloth simulation (half-cadence on mobile/medium tier for steady 60fps orbit)
    const dragImpulseX = Math.max(-14, Math.min(14, -velRing * 32));
    const dragImpulseZ = Math.min(10, Math.abs(velRing) * 18);
    clothFrame = (clothFrame + 1) % clothStride;
    if (dirtyStill || Math.abs(velRing) > 0.0005 || (motion && clothFrame === 0)) {
      cloth.step(t, dragImpulseX, dragImpulseZ, motion);
      gl.bindBuffer(gl.ARRAY_BUFFER, clothPosBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, cloth.positions);
      gl.bindBuffer(gl.ARRAY_BUFFER, clothNormBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, cloth.normals);
      dirtyStill = false;
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Pass 1: Atmospheric Studio Shader Backdrop
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.depthMask(false);
    gl.disable(gl.BLEND);
    gl.useProgram(pBg);
    bindAttrib(gl, loc.bg.aPos, bgBuf, 2);
    gl.uniform2f(loc.bg.uRes, canvas.width, canvas.height);
    gl.uniform2f(loc.bg.uPointer, pointer[0], pointer[1]);
    gl.uniform1f(loc.bg.uTime, t);
    gl.uniform1f(loc.bg.uMotion, motion);
    gl.uniform3fv(loc.bg.uToneA, curTone.a);
    gl.uniform3fv(loc.bg.uToneB, curTone.b);
    gl.uniform3fv(loc.bg.uToneC, curTone.c);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Camera matrices (aspect-safe pullback prevents near-plane clipping on portrait containers)
    const aspect = canvas.width / Math.max(1, canvas.height);
    const safeAspect = Math.max(0.5, aspect);
    const fov = safeAspect < 1 ? 0.82 : 0.68;
    const eyeX = pointer[0] * 0.22;
    const eyeY = 0.44 + pointer[1] * 0.14;
    const eyeZ = safeAspect < 1 ? Math.max(4.95, 4.35 / safeAspect) : 4.28;
    const eye = [eyeX, eyeY, eyeZ];
    const proj = perspective(fov, aspect, 0.2, 24);
    const view = lookAt(eye, [0, -0.02, 0], [0, 1, 0]);
    const vp = mul4(proj, view);

    // Enable 3D depth testing + blending
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Pass 2: Studio Orbital Pedestal Rings
    gl.depthMask(false);
    gl.useProgram(pFloor);
    bindAttrib(gl, loc.floor.aPos, floorPosBuf, 3);
    bindAttrib(gl, loc.floor.aUv, floorUvBuf, 2);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorIdxBuf);
    gl.uniform3fv(loc.floor.uColor, colLine);
    gl.uniform3fv(loc.floor.uMetalRim, colRim);

    const outerRingM = model(0, ring * 0.2, 0, -0.66, 0, ORBIT_RADIUS + 0.04);
    gl.uniformMatrix4fv(loc.floor.uMvp, false, mul4(vp, outerRingM));
    gl.uniform1f(loc.floor.uAlpha, 0.26);
    gl.drawElements(gl.TRIANGLES, floorMesh.indices.length, gl.UNSIGNED_SHORT, 0);

    const innerRingM = model(0, -ring * 0.3, 0, -0.66, 0, 0.68);
    gl.uniformMatrix4fv(loc.floor.uMvp, false, mul4(vp, innerRingM));
    gl.uniform1f(loc.floor.uAlpha, 0.20);
    gl.drawElements(gl.TRIANGLES, floorMesh.indices.length, gl.UNSIGNED_SHORT, 0);

    // Pass 3: Centerpiece 3D b-shirt Sculpture + Live Verlet Woven Textile
    gl.depthMask(true);
    const idleSway = motion ? Math.sin(t * 0.52) * 0.18 : 0.12;
    const sculptureRotY = idleSway + ring * 0.10 + pointer[0] * 0.18;
    const sculptureRotX = -0.04 + pointer[1] * 0.06;
    const brandM = model(sculptureRotX, sculptureRotY, 0, 0.18, -0.18, 0.80);
    const brandMvp = mul4(vp, brandM);

    // 3a: Brushed Graphite + Champagne Metallic Hanger Sculpture
    gl.enable(gl.CULL_FACE);
    gl.useProgram(pTube);
    bindAttrib(gl, loc.tube.aPos, tubePosBuf, 3);
    bindAttrib(gl, loc.tube.aNorm, tubeNormBuf, 3);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tubeIdxBuf);
    gl.uniformMatrix4fv(loc.tube.uMvp, false, brandMvp);
    gl.uniformMatrix4fv(loc.tube.uModel, false, brandM);
    gl.uniform3fv(loc.tube.uColor, colLine);
    gl.uniform3fv(loc.tube.uMetalRim, colRim);
    gl.uniform3fv(loc.tube.uEye, eye);
    gl.uniform3f(loc.tube.uPointer3, pointer[0], pointer[1], 0);
    gl.drawElements(gl.TRIANGLES, tube.indices.length, gl.UNSIGNED_SHORT, 0);

    // 3b: Two-sided Verlet Atelier Cloth
    gl.disable(gl.CULL_FACE);
    gl.useProgram(pCloth);
    bindAttrib(gl, loc.cloth.aPos, clothPosBuf, 3);
    bindAttrib(gl, loc.cloth.aNorm, clothNormBuf, 3);
    bindAttrib(gl, loc.cloth.aUv, clothUvBuf, 2);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, clothIdxBuf);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, weaveTex);
    gl.uniform1i(loc.cloth.uWeaveTex, 0);
    gl.uniformMatrix4fv(loc.cloth.uMvp, false, brandMvp);
    gl.uniformMatrix4fv(loc.cloth.uModel, false, brandM);
    gl.uniform3fv(loc.cloth.uColor, curTone.fabric);
    gl.uniform3fv(loc.cloth.uMetalRim, colRim);
    gl.uniform3fv(loc.cloth.uEye, eye);
    gl.uniform3f(loc.cloth.uPointer3, pointer[0], pointer[1], 0);
    gl.uniform1f(loc.cloth.uTime, t);
    gl.uniform1f(loc.cloth.uMotion, motion);
    gl.drawElements(gl.TRIANGLES, cloth.indices.length, gl.UNSIGNED_SHORT, 0);

    // Pass 4: Curved Cylindrical 3D Product Cards
    const n = items.length;
    if (n > 0) {
      gl.useProgram(pCard);
      bindAttrib(gl, loc.card.aPos, cardPosBuf, 3);
      bindAttrib(gl, loc.card.aNorm, cardNormBuf, 3);
      bindAttrib(gl, loc.card.aLocal, cardLocalBuf, 2);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cardIdxBuf);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, weaveTex);
      gl.uniform1i(loc.card.uBackTex, 1);
      gl.uniform3fv(loc.card.uBack, colBack);
      gl.uniform3fv(loc.card.uRim, colRim);
      gl.uniform3fv(loc.card.uEye, eye);
      gl.uniform3fv(loc.card.uFogColor, curTone.fog);
      gl.uniform1f(loc.card.uTime, t);
      gl.uniform1f(loc.card.uMotion, motion);

      // Build draw order sorted back-to-front by world Z so rounded card edges alpha-blend cleanly
      const cardsData = [];
      for (let i = 0; i < n; i += 1) {
        const theta = wrapAngle(ring + slotAngle(i, n));
        const frontness = Math.max(0, Math.cos(theta));
        const depth = (1 - Math.cos(theta)) * 0.5;
        const focus = i === selected ? 0.55 + 0.45 * frontness : frontness * 0.25;
        const s = 0.86 + frontness * 0.24;
        const cx = Math.sin(theta) * ORBIT_RADIUS;
        const cz = Math.cos(theta) * ORBIT_RADIUS;
        const cy = -0.12 + frontness * 0.10;
        const m = model(0, theta, cx, cy, cz, 1);
        // Scale local card unit plane by physical 3:4 size * focus boost
        m[0] *= CARD_W * s; m[1] *= CARD_W * s; m[2] *= CARD_W * s;
        m[4] *= CARD_H * s; m[5] *= CARD_H * s; m[6] *= CARD_H * s;
        cardsData.push({ i, theta, cz, frontness, focus, depth, m });
      }
      cardsData.sort((a, b) => a.cz - b.cz);

      const projected = [];
      for (const c of cardsData) {
        const mvp = mul4(vp, c.m);
        const item = items[c.i];
        const entry = texCache.get(item.src);
        const tex = entry ? entry.tex : loadTex(item.src);
        const uv = coverUv(entry ? entry.aspect : 3 / 4, item.position, CARD_W / CARD_H);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(loc.card.uTex, 0);
        gl.uniform4f(loc.card.uUvRect, uv.u0, uv.v0, uv.u1, uv.v1);
        gl.uniformMatrix4fv(loc.card.uMvp, false, mvp);
        gl.uniformMatrix4fv(loc.card.uModel, false, c.m);
        gl.uniform1f(loc.card.uFocus, c.focus);
        gl.uniform1f(loc.card.uDepthFade, c.depth);
        gl.drawElements(gl.TRIANGLES, cardMesh.indices.length, gl.UNSIGNED_SHORT, 0);

        // Compute screen bounding rect for pointer picking
        const corners = [
          projectPoint(mvp, -0.5, -0.5, 0, cw, ch),
          projectPoint(mvp, 0.5, -0.5, 0, cw, ch),
          projectPoint(mvp, -0.5, 0.5, 0, cw, ch),
          projectPoint(mvp, 0.5, 0.5, 0, cw, ch),
        ].filter(Boolean);
        if (corners.length >= 3) {
          let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity;
          for (const [px, py, pz] of corners) {
            if (px < minX) minX = px;
            if (px > maxX) maxX = px;
            if (py < minY) minY = py;
            if (py > maxY) maxY = py;
            if (pz < minZ) minZ = pz;
          }
          const boxW = maxX - minX;
          const boxH = maxY - minY;
          projected.push({
            index: c.i,
            x: minX + boxW * 0.5,
            y: minY + boxH * 0.5,
            w: boxW,
            h: boxH,
            depth: -minZ,
          });
        }
      }
      lastBoxes = projected;
    } else {
      lastBoxes = [];
    }
  }

  function tick(now) {
    if (!running || destroyed) return;
    renderNow(now);
    const settling = Math.abs(wrapAngle(targetRing - ring)) > 0.001 || Math.abs(velRing) > 0.0005;
    if (motion || settling || dragging) {
      rafId = requestAnimationFrame(tick);
    } else {
      running = false;
      rafId = 0;
    }
  }

  function ensureRunning() {
    if (destroyed || running) return;
    running = true;
    lastFrame = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  // Pointer & Wheel & Keyboard interactions
  const DRAG_THRESHOLD_PX = 8;
  let dragging = false;
  let dragStartX = 0, dragStartY = 0;
  let lastX = 0;
  let dragMoved = false;
  let activePointerId = null;

  function onPointerDown(e) {
    if (e.button > 0) return;
    activePointerId = e.pointerId;
    dragStartX = lastX = e.clientX;
    dragStartY = e.clientY;
    dragMoved = false;
    dragging = true;
    velRing = 0;
    try { canvas.setPointerCapture(e.pointerId); } catch {}
    ensureRunning();
  }

  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    const ny = 1 - ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2;
    pointerTarget = [Math.max(-1, Math.min(1, nx)), Math.max(-1, Math.min(1, ny))];

    if (!dragging) {
      const hit = items.length ? pickCard(lastBoxes, e.clientX - rect.left, e.clientY - rect.top) : -1;
      canvas.style.cursor = hit >= 0 ? 'pointer' : 'grab';
      if (!running && motion) ensureRunning();
      else if (!motion) renderNow(performance.now());
      return;
    }

    if (!dragMoved) {
      if (Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY) <= DRAG_THRESHOLD_PX) return;
      dragMoved = true;
      lastX = e.clientX;
      canvas.style.cursor = 'grabbing';
      return;
    }

    const dx = e.clientX - lastX;
    lastX = e.clientX;
    if (items.length > 0) {
      const delta = (dx / Math.max(180, cw)) * 3.1;
      ring = wrapAngle(ring + delta);
      velRing = delta;
      targetRing = ring;
      const fi = frontIndex(ring, items.length);
      if (fi !== selected) {
        selected = fi;
        onSelect?.(fi, 'orbit');
      }
    }
  }

  function endDrag(e) {
    if (!dragging || (activePointerId !== null && e.pointerId !== activePointerId)) return;
    dragging = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch {}
    activePointerId = null;
    canvas.style.cursor = 'grab';
    if (e.pointerType === 'touch') pointerTarget = [0, 0];
    if (!items.length) return;

    if (!dragMoved && e.type !== 'pointercancel') {
      const rect = canvas.getBoundingClientRect();
      const hit = pickCard(lastBoxes, e.clientX - rect.left, e.clientY - rect.top);
      if (hit >= 0) {
        selected = hit;
        targetRing = ringTargetFor(hit, items.length, ring);
        onSelect?.(hit, 'tap');
        ensureRunning();
        return;
      }
    }
    const fi = frontIndex(ring, items.length);
    selected = fi;
    targetRing = ringTargetFor(fi, items.length, ring);
    ensureRunning();
  }

  function onPointerLeave() {
    pointerTarget = [0, 0];
    if (!motion) renderNow(performance.now());
  }

  let wheelAccum = 0;
  function onWheel(e) {
    if (!items.length) return;
    // Allow normal vertical page scrolling; only capture deliberate horizontal trackpad/Shift scroll
    const absX = Math.abs(e.deltaX), absY = Math.abs(e.deltaY);
    const dx = e.shiftKey ? e.deltaY : e.deltaX;
    if (!e.shiftKey && absX <= absY * 1.15) return;
    e.preventDefault();
    wheelAccum += dx;
    if (Math.abs(wheelAccum) > 36) {
      const dir = wheelAccum > 0 ? 1 : -1;
      wheelAccum = 0;
      const next = stepIndex(selected, dir, items.length);
      selected = next;
      targetRing = ringTargetFor(next, items.length, ring);
      onSelect?.(next, 'orbit');
      ensureRunning();
    }
  }

  function onKeyDown(e) {
    if (!items.length) return;
    let next = null;
    if (e.key === 'ArrowRight') next = stepIndex(selected, 1, items.length);
    else if (e.key === 'ArrowLeft') next = stepIndex(selected, -1, items.length);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    if (next !== null) {
      e.preventDefault();
      selected = next;
      targetRing = ringTargetFor(next, items.length, ring);
      onSelect?.(next, 'keyboard');
      ensureRunning();
    }
  }

  function onContextLost(e) {
    e.preventDefault();
    destroy();
    onLost?.();
  }

  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  ro?.observe(canvas);
  addEventListener('resize', resize);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('webglcontextlost', onContextLost);

  resize();

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    ro?.disconnect();
    removeEventListener('resize', resize);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', endDrag);
    canvas.removeEventListener('pointercancel', endDrag);
    canvas.removeEventListener('pointerleave', onPointerLeave);
    canvas.removeEventListener('wheel', onWheel);
    canvas.removeEventListener('keydown', onKeyDown);
    canvas.removeEventListener('webglcontextlost', onContextLost);

    gl.deleteBuffer(bgBuf);
    gl.deleteBuffer(tubePosBuf);
    gl.deleteBuffer(tubeNormBuf);
    gl.deleteBuffer(tubeIdxBuf);
    gl.deleteBuffer(cardPosBuf);
    gl.deleteBuffer(cardNormBuf);
    gl.deleteBuffer(cardLocalBuf);
    gl.deleteBuffer(cardIdxBuf);
    gl.deleteBuffer(floorPosBuf);
    gl.deleteBuffer(floorUvBuf);
    gl.deleteBuffer(floorIdxBuf);
    gl.deleteBuffer(clothPosBuf);
    gl.deleteBuffer(clothNormBuf);
    gl.deleteBuffer(clothUvBuf);
    gl.deleteBuffer(clothIdxBuf);
    gl.deleteTexture(fallbackTex);
    gl.deleteTexture(weaveTex);
    for (const entry of texCache.values()) gl.deleteTexture(entry.tex);
    texCache.clear();
    gl.deleteProgram(pBg);
    gl.deleteProgram(pTube);
    gl.deleteProgram(pCloth);
    gl.deleteProgram(pFloor);
    gl.deleteProgram(pCard);
  }

  return {
    setItems(list, selectIndex = 0) {
      items = Array.isArray(list) ? list : [];
      selected = Math.max(0, Math.min(selectIndex, Math.max(0, items.length - 1)));
      if (items.length) {
        // Prioritize front focused card and immediate neighbors before loading outer ring slots.
        const order = [selected];
        for (let offset = 1; offset <= items.length; offset += 1) {
          const right = (selected + offset) % items.length;
          const left = (selected - offset + items.length) % items.length;
          if (!order.includes(right)) order.push(right);
          if (!order.includes(left)) order.push(left);
        }
        order.forEach((idx) => loadTex(items[idx].src));
      }
      velRing = 0;
      dragging = false;
      activePointerId = null;
      ring = targetRing = items.length ? ringTargetFor(selected, items.length, 0) : 0;
      dirtyStill = true;
      renderNow(performance.now());
      if (motion) ensureRunning();
    },
    select(i) {
      if (!items.length) return;
      selected = Math.max(0, Math.min(i, items.length - 1));
      velRing = 0;
      targetRing = ringTargetFor(selected, items.length, ring);
      if (motion) ensureRunning();
      else {
        ring = targetRing;
        dirtyStill = true;
        renderNow(performance.now());
      }
    },
    setFilterTone(filterKey) {
      targetToneKey = TONE_PALETTES[filterKey] ? filterKey : 'all';
      dirtyStill = true;
      if (motion) ensureRunning();
      else renderNow(performance.now());
    },
    setMotion(on) {
      motion = on ? 1 : 0;
      dirtyStill = true;
      if (motion) ensureRunning();
      else renderNow(performance.now());
    },
    start() {
      renderNow(performance.now());
      if (motion) ensureRunning();
    },
    stop() {
      running = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    },
    get ringAngle() {
      return ring;
    },
    debugProject() {
      return lastBoxes.map((b) => ({ ...b }));
    },
    destroy,
  };
}
