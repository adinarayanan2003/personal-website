/**
 * A tiny pixel-art renderer for the project scenes.
 *
 * Scenes draw palette indices into a low-resolution buffer (one entry per on-screen
 * "pixel"). The React wrapper maps indices to colors and scales the canvas up with
 * nearest-neighbor, the same way the hero field works.
 */

import { BAYER_4 } from "@/lib/pixel";

/** Palette indices. 0 is transparent so the panel behind shows through. */
export const C = {
  NONE: 0,
  GRID: 1,
  T1: 2,
  T2: 3,
  T3: 4,
  T4: 5,
  W1: 6,
  W2: 7,
  W3: 8,
  N1: 9,
  N2: 10,
  N3: 11,
  INK: 12,
} as const;

export const PALETTE = [
  "#000000", // unused, index 0 is transparent
  "#232625", // GRID  faint structure
  "#15383a", // T1    dim teal
  "#0e6c72", // T2    mid teal
  "#1eaab1", // T3    bright teal
  "#7ff3f6", // T4    hot teal
  "#46271a", // W1    dim warm
  "#b8653a", // W2    warm
  "#f2a068", // W3    hot warm
  "#2e2e2c", // N1    panel
  "#4f4c48", // N2    structure
  "#8f8a82", // N3    quiet text
  "#f4efe7", // INK   text and highlights
];

/** 8x8 Bayer thresholds in (0, 1), used for the dissolve-in. */
export const BAYER_8 = (() => {
  const m = [
    0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30,
    54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23,
    61, 29, 53, 21,
  ];
  return new Float32Array(m.map((v) => (v + 0.5) / 64));
})();

/* 3x5 pixel font, written row by row. */
const GLYPH_ROWS: Record<string, [string, string, string, string, string]> = {
  A: [".#.", "#.#", "###", "#.#", "#.#"],
  B: ["##.", "#.#", "##.", "#.#", "##."],
  C: [".##", "#..", "#..", "#..", ".##"],
  D: ["##.", "#.#", "#.#", "#.#", "##."],
  E: ["###", "#..", "##.", "#..", "###"],
  F: ["###", "#..", "##.", "#..", "#.."],
  G: [".##", "#..", "#.#", "#.#", ".##"],
  H: ["#.#", "#.#", "###", "#.#", "#.#"],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  J: ["..#", "..#", "..#", "#.#", ".#."],
  K: ["#.#", "#.#", "##.", "#.#", "#.#"],
  L: ["#..", "#..", "#..", "#..", "###"],
  M: ["#.#", "###", "###", "#.#", "#.#"],
  N: ["##.", "#.#", "#.#", "#.#", "#.#"],
  O: [".#.", "#.#", "#.#", "#.#", ".#."],
  P: ["##.", "#.#", "##.", "#..", "#.."],
  Q: [".#.", "#.#", "#.#", "##.", ".##"],
  R: ["##.", "#.#", "##.", "#.#", "#.#"],
  S: [".##", "#..", ".#.", "..#", "##."],
  T: ["###", ".#.", ".#.", ".#.", ".#."],
  U: ["#.#", "#.#", "#.#", "#.#", "###"],
  V: ["#.#", "#.#", "#.#", "#.#", ".#."],
  W: ["#.#", "#.#", "###", "###", "#.#"],
  X: ["#.#", "#.#", ".#.", "#.#", "#.#"],
  Y: ["#.#", "#.#", ".#.", ".#.", ".#."],
  Z: ["###", "..#", ".#.", "#..", "###"],
  "0": ["###", "#.#", "#.#", "#.#", "###"],
  "1": [".#.", "##.", ".#.", ".#.", "###"],
  "2": ["##.", "..#", ".#.", "#..", "###"],
  "3": ["##.", "..#", ".#.", "..#", "##."],
  "4": ["#.#", "#.#", "###", "..#", "..#"],
  "5": ["###", "#..", "##.", "..#", "##."],
  "6": [".##", "#..", "###", "#.#", "###"],
  "7": ["###", "..#", ".#.", ".#.", ".#."],
  "8": ["###", "#.#", "###", "#.#", "###"],
  "9": ["###", "#.#", "###", "..#", "##."],
  ".": ["...", "...", "...", "...", ".#."],
  ":": ["...", ".#.", "...", ".#.", "..."],
  "/": ["..#", "..#", ".#.", "#..", "#.."],
  ">": ["#..", ".#.", "..#", ".#.", "#.."],
  "<": ["..#", ".#.", "#..", ".#.", "..#"],
  "-": ["...", "...", "###", "...", "..."],
  "+": ["...", ".#.", "###", ".#.", "..."],
  "%": ["#.#", "..#", ".#.", "#..", "#.#"],
  "(": [".#.", "#..", "#..", "#..", ".#."],
  ")": [".#.", "..#", "..#", "..#", ".#."],
  "[": ["##.", "#..", "#..", "#..", "##."],
  "]": [".##", "..#", "..#", "..#", ".##"],
  ",": ["...", "...", "...", ".#.", "#.."],
  "'": [".#.", ".#.", "...", "...", "..."],
  "?": ["##.", "..#", ".#.", "...", ".#."],
  "!": [".#.", ".#.", ".#.", "...", ".#."],
  "=": ["...", "###", "...", "###", "..."],
  _: ["...", "...", "...", "...", "###"],
  "#": ["#.#", "###", "#.#", "###", "#.#"],
  "*": ["#.#", ".#.", "#.#", "...", "..."],
  " ": ["...", "...", "...", "...", "..."],
};

const FONT: Record<string, Uint8Array> = {};
for (const [ch, rows] of Object.entries(GLYPH_ROWS)) {
  const cells = new Uint8Array(15);
  rows.join("").split("").forEach((cell, i) => (cells[i] = cell === "#" ? 1 : 0));
  FONT[ch] = cells;
}

export const GLYPH_W = 3;
export const GLYPH_H = 5;
export const GLYPH_ADV = 4;

export class Gfx {
  cols = 0;
  rows = 0;
  buf = new Uint8Array(0);

  resize(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.buf = new Uint8Array(cols * rows);
  }

  clear(c = 0) {
    this.buf.fill(c);
  }

  px(x: number, y: number, c: number) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return;
    this.buf[y * this.cols + x] = c;
  }

  get(x: number, y: number) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return 0;
    return this.buf[y * this.cols + x];
  }

  rect(x: number, y: number, w: number, h: number, c: number) {
    const x0 = Math.max(0, Math.round(x));
    const y0 = Math.max(0, Math.round(y));
    const x1 = Math.min(this.cols, Math.round(x + w));
    const y1 = Math.min(this.rows, Math.round(y + h));
    for (let yy = y0; yy < y1; yy++) this.buf.fill(c, yy * this.cols + x0, yy * this.cols + x1);
  }

  frame(x: number, y: number, w: number, h: number, c: number) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    this.rect(x, y, w, 1, c);
    this.rect(x, y + h - 1, w, 1, c);
    this.rect(x, y, 1, h, c);
    this.rect(x + w - 1, y, 1, h, c);
  }

  line(x0: number, y0: number, x1: number, y1: number, c: number, dash = 0, phase = 0) {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let i = 0;
    for (;;) {
      if (!dash || Math.floor((i + phase) / dash) % 2 === 0) this.px(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
      i++;
    }
  }

  /** Point at fraction `f` (0..1) along a line. */
  lerpPoint(x0: number, y0: number, x1: number, y1: number, f: number) {
    return { x: x0 + (x1 - x0) * f, y: y0 + (y1 - y0) * f };
  }

  disc(cx: number, cy: number, r: number, c: number) {
    const r2 = r * r + r * 0.8;
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r2) this.px(cx + x, cy + y, c);
  }

  ring(cx: number, cy: number, r: number, c: number) {
    const outer = r * r + r * 0.8;
    const inner = (r - 1) * (r - 1) + (r - 1) * 0.8;
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        const d = x * x + y * y;
        if (d <= outer && d > inner) this.px(cx + x, cy + y, c);
      }
    }
  }

  /** Set a pixel to one of `ramp`'s colors, chosen by value `v` (0..1) with ordered dithering. */
  shade(x: number, y: number, v: number, ramp: readonly number[]) {
    if (v <= 0) return;
    const levels = ramp.length;
    const q = Math.min(1, v) * levels;
    let level = q | 0;
    if (q - level > BAYER_4[((Math.round(y) & 3) << 2) | (Math.round(x) & 3)]) level++;
    if (level > 0) this.px(x, y, ramp[Math.min(levels, level) - 1]);
  }

  /** Dithered radial glow. */
  glow(cx: number, cy: number, r: number, strength: number, ramp: readonly number[]) {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const d = Math.hypot(x - cx, y - cy) / r;
        if (d < 1) this.shade(x, y, (1 - d) * strength, ramp);
      }
    }
  }

  text(x: number, y: number, s: string, c: number) {
    x = Math.round(x);
    y = Math.round(y);
    const str = s.toUpperCase();
    for (let i = 0; i < str.length; i++) {
      const glyph = FONT[str[i]] ?? FONT["?"];
      for (let gy = 0; gy < GLYPH_H; gy++) {
        for (let gx = 0; gx < GLYPH_W; gx++) {
          if (glyph[gy * GLYPH_W + gx]) this.px(x + i * GLYPH_ADV + gx, y + gy, c);
        }
      }
    }
    return str.length * GLYPH_ADV - 1;
  }

  textWidth(s: string) {
    return s.length * GLYPH_ADV - 1;
  }
}

export type Pointer = { x: number; y: number } | null;

export type SceneFrame = {
  g: Gfx;
  /** Seconds since the scene started. */
  t: number;
  dt: number;
  /** Pointer position in cells, or null when the pointer is elsewhere. */
  pointer: Pointer;
};

export type Scene = (frame: SceneFrame) => void;

/** Seeded PRNG so every scene lays out the same way on every visit. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Scatter points in a box, keeping them at least `gap` cells apart. */
export function scatter(
  rand: () => number,
  count: number,
  box: { x0: number; y0: number; x1: number; y1: number },
  gap: number,
) {
  const pts: { x: number; y: number }[] = [];
  let tries = 0;
  while (pts.length < count && tries < count * 200) {
    tries++;
    const p = {
      x: Math.round(box.x0 + rand() * (box.x1 - box.x0)),
      y: Math.round(box.y0 + rand() * (box.y1 - box.y0)),
    };
    if (pts.every((q) => Math.hypot(q.x - p.x, q.y - p.y) >= gap)) pts.push(p);
  }
  return pts;
}

/** Faint dot grid. Most scenes sit on it so they read as "technical drawings". */
export function dotGrid(g: Gfx, step = 4) {
  for (let y = 1; y < g.rows; y += step) for (let x = 1; x < g.cols; x += step) g.px(x, y, C.GRID);
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const ease = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};

/** Text on a small solid plate, kept inside the canvas. */
export function tag(g: Gfx, x: number, y: number, s: string, fg: number = C.INK, bg: number = C.N1) {
  const w = g.textWidth(s) + 4;
  const h = 9;
  const px = Math.max(1, Math.min(g.cols - w - 1, Math.round(x)));
  const py = Math.max(1, Math.min(g.rows - h - 1, Math.round(y)));
  g.rect(px, py, w, h, bg);
  g.text(px + 2, py + 2, s, fg);
  return { x: px, y: py, w, h };
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
