/**
 * Pixel field math, shared by the live canvas and the generated OG image.
 *
 * The look: a soft pool of light that drifts, broken up by slow domain-warped
 * noise and a faint diagonal current, then quantized into a few flat colors
 * with a 4x4 ordered (Bayer) dither. Rendered at one texel per cell and scaled
 * up with nearest-neighbor, so every "pixel" is a crisp square.
 */

/** 4x4 Bayer thresholds, normalized into (0, 1). Index with ((y & 3) << 2) | (x & 3). */
export const BAYER_4 = new Float32Array(
  [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16),
);

export type Noise2D = (x: number, y: number) => number;

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeded 2D value noise with smoothstep interpolation. Returns values in [0, 1]. */
export function createValueNoise(seed = 7): Noise2D {
  const rand = mulberry32(seed);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = p[i];
    p[i] = p[j];
    p[j] = tmp;
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const values = new Float32Array(256);
  for (let i = 0; i < 256; i++) values[i] = rand();

  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const X = xi & 255;
    const Y = yi & 255;
    const a = values[perm[perm[X] + Y]];
    const b = values[perm[perm[X + 1] + Y]];
    const c = values[perm[perm[X] + Y + 1]];
    const d = values[perm[perm[X + 1] + Y + 1]];
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

export type FieldShape = {
  /** Pool center, as a fraction of the field (0 = left/top, 1 = right/bottom). */
  originX: number;
  originY: number;
  /** Pool radius as a fraction of the field diagonal. */
  radius: number;
  /** Overall brightness, 0 to 1. */
  intensity: number;
  /** Number of lit color levels (level 0 is always empty). */
  levels: number;
};

/**
 * Fill `out` with a color level (0..shape.levels) for every cell at time `t` (seconds).
 * `boost` adds extra light per cell, used for the pointer trail.
 * `gain` scales each cell before dithering, so the field thins out pixel by pixel
 * (behind text, toward an edge) instead of fading under a translucent overlay.
 */
export function renderField(
  out: Uint8Array,
  cols: number,
  rows: number,
  t: number,
  shape: FieldShape,
  noise: Noise2D,
  boost?: Float32Array | null,
  gain?: Float32Array | null,
) {
  const { originX, originY, radius, intensity, levels } = shape;
  const cx = cols * (originX + 0.035 * Math.sin(t * 0.21));
  const cy = rows * (originY + 0.05 * Math.cos(t * 0.16));
  const invR = 1 / (Math.hypot(cols, rows) * radius);

  const driftX1 = t * 0.42;
  const driftY1 = t * -0.26;
  const driftX2 = t * -0.14;
  const driftY2 = t * 0.09;
  const phase = t * 1.3;

  for (let y = 0; y < rows; y++) {
    const dy = (y - cy) * 1.2;
    const dy2 = dy * dy;
    const bayerRow = (y & 3) << 2;
    const rowOffset = y * cols;

    for (let x = 0; x < cols; x++) {
      const i = rowOffset + x;
      const dx = x - cx;

      let pool = 1 - Math.sqrt(dx * dx + dy2) * invR;
      pool = pool <= 0 ? 0 : pool * pool * (3 - 2 * pool);

      const n1 = noise(x * 0.07 + driftX1, y * 0.07 + driftY1);
      const n2 = noise(x * 0.024 + driftX2 + n1 * 1.7, y * 0.024 + driftY2 + n1 * 1.7);
      const current = Math.sin(x * 0.12 + y * 0.075 - phase);

      let v =
        pool * 0.9 +
        (n2 - 0.5) * (0.35 + pool) * 0.95 +
        current * 0.09 * (0.3 + pool) +
        (n1 - 0.5) * 0.14;

      if (gain) v *= gain[i];
      if (boost) v += boost[i];
      v *= intensity;

      if (v <= 0) {
        out[i] = 0;
        continue;
      }

      const q = v * levels;
      let level = q | 0;
      if (q - level > BAYER_4[bayerRow | (x & 3)]) level++;
      out[i] = level > levels ? levels : level;
    }
  }
}

/** "#rrggbb" to a little-endian RGBA Uint32 for ImageData writes. */
export function hexToRGBA32(hex: string, alpha = 255) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return ((alpha << 24) | (b << 16) | (g << 8) | r) >>> 0;
}

/** Default teal palette for levels 1..3. */
export const TEAL = ["#15383a", "#0e6c72", "#1eaab1"];

export type FieldMask = "none" | "hero" | "contact";

const smooth = (a: number, b: number, v: number) => {
  const x = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

/** Per-cell gain for a mask preset. `wide` is true when the hero copy sits in a left column. */
export function maskGain(mask: FieldMask, cols: number, rows: number, wide: boolean) {
  if (mask === "none") return null;
  const gain = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    const fy = y / rows;
    for (let x = 0; x < cols; x++) {
      const fx = x / cols;
      let g = 1;
      if (mask === "hero") {
        // Thin behind the copy, full strength around the card, dissolve at the bottom.
        const side = wide
          ? smooth(0.26, 0.64, fx)
          : 1 - smooth(0.2, 0.95, Math.hypot((1 - fx) * 0.85, fy * 1.7));
        g = (0.22 + 0.78 * side) * (1 - smooth(0.6, 0.98, fy));
      } else if (mask === "contact") {
        g = smooth(0.12, 0.7, fy);
      }
      gain[y * cols + x] = g;
    }
  }
  return gain;
}
