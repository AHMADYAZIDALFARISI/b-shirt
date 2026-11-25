// Real-time Verlet woven textile simulation + procedural atelier cloth texture synthesis.
// Inspired by MengTo/threeui (WovenCloth atelier & iridescent silk, MIT License).
// Zero external images or dependencies: generates crisp linen weave albedo + micro-bump normal
// map with subtle "b-shirt" woven monogram and stitched hems on an offscreen 2D canvas.

/**
 * Create a real-time Verlet cloth simulation tied to a plane grid of (segX+1) x (segY+1) vertices.
 * Top row (y = 0) is pinned to the hanger crossbar; lower rows respond to studio draft & drag velocity.
 */
export function createVerletCloth({ width = 0.88, length = 0.96, segX = 18, segY = 28, barY = 0.28 } = {}) {
  const cols = segX + 1;
  const rows = segY + 1;
  const count = cols * rows;
  const cur = new Float32Array(count * 3);
  const prev = new Float32Array(count * 3);
  const rest = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const pinned = new Uint8Array(count);

  const idx = (ix, iy) => ix + iy * cols;
  for (let iy = 0; iy < rows; iy += 1) {
    const v = iy / segY;
    for (let ix = 0; ix < cols; ix += 1) {
      const u = ix / segX;
      const i = idx(ix, iy);
      const px = (u - 0.5) * width * (1 - 0.06 * v);
      const py = barY - v * length;
      const pz = -0.03 + 0.025 * Math.sin(Math.PI * Math.min(v * 1.15, 1));
      cur[i * 3] = prev[i * 3] = rest[i * 3] = px;
      cur[i * 3 + 1] = prev[i * 3 + 1] = rest[i * 3 + 1] = py;
      cur[i * 3 + 2] = prev[i * 3 + 2] = rest[i * 3 + 2] = pz;
      uvs[i * 2] = u;
      uvs[i * 2 + 1] = v;
      if (iy === 0) pinned[i] = 1;
    }
  }

  const indices = [];
  for (let iy = 0; iy < segY; iy += 1) {
    for (let ix = 0; ix < segX; ix += 1) {
      const a = idx(ix, iy), b = a + 1, c = a + cols, d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const restH = width / segX;
  const restV = length / segY;
  const restD = Math.hypot(restH, restV);
  const GRAV = -2.4;
  const DAMP = 0.976;
  const DT = 0.016;

  function solve(a, b, rl) {
    const ax = cur[a * 3], ay = cur[a * 3 + 1], az = cur[a * 3 + 2];
    let dx = cur[b * 3] - ax, dy = cur[b * 3 + 1] - ay, dz = cur[b * 3 + 2] - az;
    const d = Math.hypot(dx, dy, dz) || 1e-6;
    const diff = ((d - rl) / d) * 0.5;
    dx *= diff; dy *= diff; dz *= diff;
    const pa = pinned[a], pb = pinned[b];
    if (!pa && !pb) {
      cur[a * 3] += dx; cur[a * 3 + 1] += dy; cur[a * 3 + 2] += dz;
      cur[b * 3] -= dx; cur[b * 3 + 1] -= dy; cur[b * 3 + 2] -= dz;
    } else if (pa && !pb) {
      cur[b * 3] -= dx * 2; cur[b * 3 + 1] -= dy * 2; cur[b * 3 + 2] -= dz * 2;
    } else if (!pa && pb) {
      cur[a * 3] += dx * 2; cur[a * 3 + 1] += dy * 2; cur[a * 3 + 2] += dz * 2;
    }
  }

  function step(t, impulseX = 0, impulseZ = 0, motion = 1) {
    const activeMotion = Math.max(0, Math.min(1, motion));
    for (let iy = 0; iy < rows; iy += 1) {
      const cy = iy / segY;
      for (let ix = 0; ix < cols; ix += 1) {
        const i = idx(ix, iy);
        if (pinned[i]) continue;
        const cx = ix / segX;
        const travel = t * 1.45 - cy * 3.1;
        const gust = 0.52 + 0.34 * Math.sin(t * 0.48) + 0.14 * Math.sin(t * 1.37 + 0.9);
        const reach = cy * (0.28 + 0.72 * cy);
        const fz = (Math.sin(travel + cx * 2.4) + 0.42 * Math.sin(travel * 1.6 + cx * 4.8)) * 2.1 * reach * gust * activeMotion + impulseZ * reach;
        const fx = (Math.sin(t * 0.72 + cy * 1.9) * 0.55 * reach * (cx - 0.5) + impulseX * reach * 1.4) * (0.35 + 0.65 * activeMotion);
        const fy = GRAV + Math.cos(travel) * 0.14 * reach * activeMotion;

        for (let k = 0; k < 3; k += 1) {
          const j = i * 3 + k;
          const a = k === 0 ? fx : k === 1 ? fy : fz;
          const v = (cur[j] - prev[j]) * DAMP;
          prev[j] = cur[j];
          cur[j] = cur[j] + v + a * DT * DT;
        }
      }
    }
    for (let it = 0; it < 3; it += 1) {
      for (let iy = 0; iy < rows; iy += 1) {
        const shrink = 1 - 0.06 * (iy / segY);
        for (let ix = 0; ix < segX; ix += 1) solve(idx(ix, iy), idx(ix + 1, iy), restH * shrink);
      }
      for (let iy = 0; iy < segY; iy += 1) {
        for (let ix = 0; ix < cols; ix += 1) solve(idx(ix, iy), idx(ix, iy + 1), restV);
      }
      for (let iy = 0; iy < segY; iy += 1) {
        for (let ix = 0; ix < segX; ix += 1) {
          solve(idx(ix, iy), idx(ix + 1, iy + 1), restD);
          solve(idx(ix + 1, iy), idx(ix, iy + 1), restD);
        }
      }
    }
    // Pin top row with subtle natural pleat wave so fabric catches studio rim light
    for (let ix = 0; ix < cols; ix += 1) {
      const i = ix;
      const cx = ix / segX;
      const pleat = Math.sin(cx * Math.PI * 3.0) * 0.035;
      cur[i * 3] = prev[i * 3] = rest[i * 3];
      cur[i * 3 + 1] = prev[i * 3 + 1] = rest[i * 3 + 1];
      cur[i * 3 + 2] = prev[i * 3 + 2] = rest[i * 3 + 2] + pleat;
    }
    computeNormals();
  }

  function computeNormals() {
    normals.fill(0);
    for (let i = 0; i < indices.length; i += 3) {
      const ia = indices[i] * 3, ib = indices[i + 1] * 3, ic = indices[i + 2] * 3;
      const abx = cur[ib] - cur[ia], aby = cur[ib + 1] - cur[ia + 1], abz = cur[ib + 2] - cur[ia + 2];
      const acx = cur[ic] - cur[ia], acy = cur[ic + 1] - cur[ia + 1], acz = cur[ic + 2] - cur[ia + 2];
      const nx = aby * acz - abz * acy;
      const ny = abz * acx - abx * acz;
      const nz = abx * acy - aby * acx;
      for (const base of [ia, ib, ic]) {
        normals[base] += nx;
        normals[base + 1] += ny;
        normals[base + 2] += nz;
      }
    }
    for (let i = 0; i < count; i += 1) {
      const j = i * 3;
      const l = Math.hypot(normals[j], normals[j + 1], normals[j + 2]) || 1;
      normals[j] /= l;
      normals[j + 1] /= l;
      normals[j + 2] /= l;
    }
  }

  // Warm up 65 ticks so initial still frame immediately shows natural draped folds
  for (let s = 0; s < 65; s += 1) step(s * DT, 0, 0, 1);

  return {
    positions: cur,
    normals,
    uvs,
    indices: new Uint16Array(indices),
    step,
    vertexCount: count,
  };
}

/**
 * Generates an offscreen canvas texture containing linen/satin weave micro-detail,
 * topstitch seams, and subtle "b-shirt" monogram tag (512x512, neutral warm greyscale/ivory
 * meant to be tinted dynamically by the active collection color in GLSL).
 */
export function buildWovenClothCanvas(doc = globalThis.document) {
  const W = 512, H = 512;
  const c = doc.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d');
  if (!x) return c;

  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#f4efe6');
  g.addColorStop(0.5, '#ede5d8');
  g.addColorStop(1, '#e3d9c8');
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);

  // Subtle horizontal & vertical textile threads
  x.lineWidth = 1;
  for (let py = 0; py < H; py += 4) {
    x.strokeStyle = py % 8 === 0 ? 'rgba(60,46,32,0.065)' : 'rgba(255,252,246,0.10)';
    x.beginPath();
    x.moveTo(0, py + 0.5);
    x.lineTo(W, py + 0.5);
    x.stroke();
  }
  for (let px = 0; px < W; px += 4) {
    x.strokeStyle = px % 8 === 0 ? 'rgba(48,36,24,0.055)' : 'rgba(255,252,246,0.08)';
    x.beginPath();
    x.moveTo(px + 0.5, 0);
    x.lineTo(px + 0.5, H);
    x.stroke();
  }

  // Tailored seam & topstitch border (ThreeUI woven-cloth-atelier detail)
  x.strokeStyle = 'rgba(28,26,24,0.18)';
  x.lineWidth = 2;
  x.strokeRect(22, 18, W - 44, H - 36);
  x.setLineDash([8, 6]);
  x.strokeStyle = 'rgba(255,252,248,0.65)';
  x.lineWidth = 1.5;
  x.strokeRect(30, 26, W - 60, H - 52);
  x.setLineDash([]);

  // Subtle woven monogram mark near lower hem
  x.fillStyle = 'rgba(28,26,24,0.22)';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.font = '600 32px Georgia, serif';
  x.fillText('b-shirt', W / 2, H * 0.72);
  x.font = '600 13px system-ui, -apple-system, sans-serif';
  x.fillText('A T E L I E R   ·   K O L E K S I', W / 2, H * 0.80);

  return c;
}
