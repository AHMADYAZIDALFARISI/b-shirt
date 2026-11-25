// Atmospheric WebGL1 background pass combining:
// - Paper Shaders (shaders.paper.design) MeshGradient + GrainGradient + subtle GodRays
// - ReactBits Silk wave sheen & subtle pointer spotlight
// - Unicorn Studio layered studio lighting depth
// Compiled into the single hero/stage WebGL1 canvas with zero external dependencies.

export const BG_VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.999, 1.0);
}`;

export const BG_FRAG = `
precision mediump float;
uniform vec2 uRes, uPointer;
uniform float uTime, uMotion;
uniform vec3 uToneA, uToneB, uToneC;
varying vec2 vUv;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec2 rot2(vec2 p, float a) {
  float c = cos(a), s = sin(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  // Paper Shaders MeshGradient organic warp + swirl
  float t = (uTime * 0.35 + 14.0) * (0.2 + 0.8 * uMotion);
  vec2 w = uv;
  float radius = smoothstep(0.0, 1.0, length(uv - 0.5));
  float center = 1.0 - radius;
  w.x += 0.18 * center * sin(t + 0.5 * uv.y) * cos(0.3 * t + 2.1 * uv.y);
  w.y += 0.18 * center * cos(t + 1.7 * uv.x);
  w = rot2(w - 0.5, -0.35 * radius) + 0.5;

  // Pointer-reactive soft spotlight (Unicorn Studio / ReactBits studio sweep)
  vec2 pSpot = uPointer * 0.5 + 0.5;
  vec2 spot0 = vec2(0.24 + 0.10 * sin(t * 0.7), 0.72 + 0.08 * cos(t * 0.5)) + (pSpot - 0.5) * 0.14;
  vec2 spot1 = vec2(0.78 + 0.09 * cos(t * 0.6), 0.28 + 0.10 * sin(t * 0.8)) - (pSpot - 0.5) * 0.10;
  vec2 spot2 = vec2(0.48 + 0.12 * sin(t * 0.4 + 1.5), 0.45 + 0.08 * cos(t * 0.9));

  float d0 = pow(length(w - spot0), 2.4) + 0.06;
  float d1 = pow(length(w - spot1), 2.4) + 0.06;
  float d2 = pow(length(w - spot2), 2.4) + 0.08;
  float w0 = 1.0 / d0, w1 = 1.0 / d1, w2 = 1.0 / d2;
  vec3 meshCol = (uToneA * w0 + uToneB * w1 + uToneC * w2) / (w0 + w1 + w2);

  // ReactBits Silk gentle wave highlight across studio sweep
  vec2 silkUv = rot2(p * 1.4, -0.42);
  float silkWave = 0.5 + 0.5 * sin(4.5 * (silkUv.x + silkUv.y + 0.35 * cos(2.2 * silkUv.x + 3.4 * silkUv.y) + t * 0.18));
  float silkCrest = smoothstep(0.68, 0.99, silkWave);
  meshCol = mix(meshCol, min(meshCol * 1.07 + vec3(0.03), vec3(1.0)), silkCrest * 0.45);

  // Paper Shaders GodRays soft top studio light cone
  vec2 rayUv = p - vec2(uPointer.x * 0.12, 0.72);
  float rayAngle = atan(rayUv.y, rayUv.x);
  float rayBand = 0.5 + 0.5 * sin(rayAngle * 7.0 + t * 0.45);
  float rayDist = exp(-length(rayUv) * 1.25);
  meshCol += vec3(0.99, 0.96, 0.92) * rayBand * rayDist * 0.11;

  // Radial floor depth & subtle vignette
  float floorGrad = smoothstep(0.0, 0.48, uv.y);
  meshCol *= mix(0.91, 1.02, floorGrad);
  float vig = 1.0 - 0.09 * pow(length(uv - 0.5) * 1.4, 2.0);
  meshCol *= vig;

  // Paper Shaders fine tactile grain overlay
  float grain = vnoise(gl_FragCoord.xy * 0.72) - 0.5;
  meshCol += grain * 0.032;

  gl_FragColor = vec4(clamp(meshCol, 0.0, 1.0), 1.0);
}`;
