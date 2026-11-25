// Procedural 3D geometry for b-shirt:
// 1. Continuous one-line "b-shirt" sculpture traced from the official logo-icon.png silhouette
//    (S-hook -> collar -> right sleeve loop -> torso -> hem -> left sleeve loop -> shoulder).
// 2. Curved cylindrical showcase card mesh (inspired by ThreeUI Gallery / ReactBits CircularGallery).
// 3. Studio floor orbital ring & pedestal disc for spatial grounding.
// Pure functions -> unit-tested, 100% WebGL1 Uint16 index-budget safe.

/** Centripetal-ish Catmull-Rom sampling of a 3D polyline. */
export function sampleCurve(points, samplesPerSegment = 16, closed = false) {
  const pts = points;
  const n = pts.length;
  const get = (i) => (closed ? pts[(i + n) % n] : pts[Math.min(Math.max(i, 0), n - 1)]);
  const out = [];
  const segments = closed ? n : n - 1;
  for (let i = 0; i < segments; i += 1) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    for (let s = 0; s < samplesPerSegment; s += 1) {
      const t = s / samplesPerSegment, t2 = t * t, t3 = t2 * t;
      out.push([0, 1, 2].map((k) => 0.5 * (
        2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  if (!closed) out.push([...pts[n - 1]]);
  return out;
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/**
 * Tube along a path using rotation-minimising frames (double reflection), so the tube
 * does not twist on curls such as the hook or sleeve underarm loops.
 */
export function buildTube(path, radius = 0.02, radial = 12, closed = false) {
  const count = path.length;
  const tangents = path.map((p, i) => {
    const a = path[closed ? (i - 1 + count) % count : Math.max(i - 1, 0)];
    const b = path[closed ? (i + 1) % count : Math.min(i + 1, count - 1)];
    return norm(sub(b, a));
  });
  const t0 = tangents[0];
  let n = norm(cross(t0, Math.abs(t0[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  const normals = [n];
  for (let i = 1; i < count; i += 1) {
    const v1 = sub(path[i], path[i - 1]);
    const c1 = v1[0] ** 2 + v1[1] ** 2 + v1[2] ** 2 || 1;
    const rL = sub(n, v1.map((x) => x * (2 / c1) * (v1[0] * n[0] + v1[1] * n[1] + v1[2] * n[2])));
    const tL = sub(tangents[i - 1], v1.map((x) => x * (2 / c1) * (v1[0] * tangents[i - 1][0] + v1[1] * tangents[i - 1][1] + v1[2] * tangents[i - 1][2])));
    const v2 = sub(tangents[i], tL);
    const c2 = v2[0] ** 2 + v2[1] ** 2 + v2[2] ** 2 || 1;
    n = norm(sub(rL, v2.map((x) => x * (2 / c2) * (v2[0] * rL[0] + v2[1] * rL[1] + v2[2] * rL[2]))));
    normals.push(n);
  }
  const positions = [], vNormals = [], indices = [];
  for (let i = 0; i < count; i += 1) {
    const t = tangents[i], nn = normals[i], bb = cross(t, nn);
    for (let j = 0; j < radial; j += 1) {
      const a = (j / radial) * Math.PI * 2;
      const dir = [0, 1, 2].map((k) => Math.cos(a) * nn[k] + Math.sin(a) * bb[k]);
      positions.push(path[i][0] + dir[0] * radius, path[i][1] + dir[1] * radius, path[i][2] + dir[2] * radius);
      vNormals.push(...dir);
    }
  }
  const rings = closed ? count : count - 1;
  for (let i = 0; i < rings; i += 1) {
    const i2 = (i + 1) % count;
    for (let j = 0; j < radial; j += 1) {
      const j2 = (j + 1) % radial;
      const a = i * radial + j, b = i2 * radial + j, c = i2 * radial + j2, d = i * radial + j2;
      indices.push(a, b, d, b, c, d);
    }
  }
  return { positions, normals: vNormals, indices };
}

/**
 * Hanger & continuous shirt emblem paths matching the official b-shirt logo-icon.png:
 * - hook: S-hook curving from collar scoop up to the top hook
 * - body: closed hanger support frame (used by unit tests & crossbar anchor)
 * - shirt: continuous one-line emblem path with subtle Z-depth weave at the sleeve loops
 */
export function hangerPaths() {
  const hook = [
    [-0.14, 0.84, 0.0],
    [-0.12, 0.99, 0.0],
    [0.01, 1.05, 0.0],
    [0.14, 0.97, 0.01],
    [0.14, 0.81, 0.02],
    [0.01, 0.67, 0.01],
    [-0.15, 0.52, 0.0],
    [-0.18, 0.39, 0.0],
    [-0.02, 0.31, 0.0],
    [0.18, 0.38, 0.0],
    [0.27, 0.49, 0.0],
    [0.54, 0.41, -0.01],
    [0.80, 0.21, -0.02],
    [0.95, 0.01, 0.0],
    [0.86, -0.15, 0.02],
    [0.65, -0.15, 0.03],
    [0.52, -0.02, 0.04],
    [0.54, 0.11, 0.03],
    [0.62, 0.03, -0.02],
    [0.58, -0.24, -0.02],
    [0.57, -0.62, -0.01],
    [0.54, -0.84, 0.0],
    [0.32, -0.94, 0.01],
    [0.00, -0.96, 0.01],
    [-0.32, -0.94, 0.01],
    [-0.54, -0.84, 0.0],
    [-0.57, -0.62, -0.01],
    [-0.58, -0.24, -0.02],
    [-0.62, 0.03, -0.02],
    [-0.54, 0.11, 0.03],
    [-0.52, -0.02, 0.04],
    [-0.65, -0.15, 0.03],
    [-0.86, -0.15, 0.02],
    [-0.95, 0.01, 0.0],
    [-0.80, 0.21, -0.02],
    [-0.54, 0.41, -0.01],
    [-0.31, 0.48, 0.0],
  ];
  // Sleek internal support bar crossing between shoulders so the woven atelier cloth can drape cleanly.
  const body = [
    [-0.44, 0.34, -0.03],
    [-0.44, 0.28, -0.03],
    [0.44, 0.28, -0.03],
    [0.44, 0.34, -0.03],
  ];
  return { hook, body };
}

/**
 * Draped fabric ribbon grid with uv in [0,1]^2. v=0 pins along the internal bar, v=1 is the hem.
 */
export function buildRibbon(width = 0.88, length = 0.96, segX = 18, segY = 28, barY = 0.28) {
  const positions = [], uvs = [], indices = [];
  for (let y = 0; y <= segY; y += 1) {
    const v = y / segY;
    for (let x = 0; x <= segX; x += 1) {
      const u = x / segX;
      const px = (u - 0.5) * width * (1 - 0.06 * v);
      const py = barY - v * length;
      const pz = -0.03 + 0.045 * Math.sin(Math.PI * Math.min(v * 1.15, 1));
      positions.push(px, py, pz);
      uvs.push(u, v);
    }
  }
  for (let y = 0; y < segY; y += 1) {
    for (let x = 0; x < segX; x += 1) {
      const a = y * (segX + 1) + x, b = a + 1, c = a + segX + 1, d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  return { positions, uvs, indices };
}

/** Builds the b-shirt 3D sculpture tube + draped textile grid. */
export function buildBrandObject() {
  const { hook, body } = hangerPaths();
  const emblemTube = buildTube(sampleCurve(hook, 8, false), 0.028, 12, false);
  const barTube = buildTube(sampleCurve(body, 6, true), 0.014, 8, true);
  const offset = emblemTube.positions.length / 3;
  const tube = {
    positions: [...emblemTube.positions, ...barTube.positions],
    normals: [...emblemTube.normals, ...barTube.normals],
    indices: [...emblemTube.indices, ...barTube.indices.map((i) => i + offset)],
  };
  return { tube, ribbon: buildRibbon() };
}

/**
 * Curved cylindrical-arc 3D showcase card mesh (local space width=1, height=1, subtle convex curve).
 * Inspired by ThreeUI Gallery & ReactBits CircularGallery for real specular curvature as cards orbit.
 */
export function buildCurvedCard(segX = 14, segY = 2, curveDepth = 0.085) {
  const positions = [], normals = [], locals = [], indices = [];
  for (let y = 0; y <= segY; y += 1) {
    const v = y / segY;
    const py = v - 0.5;
    for (let x = 0; x <= segX; x += 1) {
      const u = x / segX;
      const lx = u - 0.5;
      // Convex parabolic bow forward (+z at center, 0 at edges)
      const pz = curveDepth * (1 - 4 * lx * lx);
      const dzdx = -8 * curveDepth * lx;
      const len = Math.hypot(-dzdx, 1);
      positions.push(lx, py, pz);
      normals.push(-dzdx / len, 0, 1 / len);
      locals.push(u, v);
    }
  }
  for (let y = 0; y < segY; y += 1) {
    for (let x = 0; x < segX; x += 1) {
      const a = y * (segX + 1) + x, b = a + 1, c = a + segX + 1, d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }
  return { positions, normals, locals, indices };
}

/**
 * Thin studio floor ring / pedestal ellipse mesh for spatial depth & grounding.
 */
export function buildFloorRing(innerR = 0.94, outerR = 1.0, segments = 72) {
  const positions = [], uvs = [], indices = [];
  for (let i = 0; i <= segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const ca = Math.cos(a), sa = Math.sin(a);
    positions.push(ca * innerR, 0, sa * innerR);
    uvs.push(i / segments, 0);
    positions.push(ca * outerR, 0, sa * outerR);
    uvs.push(i / segments, 1);
  }
  for (let i = 0; i < segments; i += 1) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    indices.push(a, b, c, b, d, c);
  }
  return { positions, uvs, indices };
}
