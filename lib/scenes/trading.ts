import { C, dotGrid, rng, tag, type Scene } from "./engine";

type Candle = { o: number; h: number; l: number; c: number };

/**
 * Attention trading: candles scroll across an "attention index". Momentum builds in
 * bursts and fades, the way hype does. Hover for a crosshair and a price.
 */
export function trading(seed = 17): Scene {
  const rand = rng(seed);
  const candles: Candle[] = [];
  let price = 42;
  let momentum = 0;
  let step = -1;

  const next = (): Candle => {
    if (rand() < 0.09) momentum += (rand() - 0.32) * 3.4;
    momentum *= 0.84;
    const o = price;
    const c = Math.max(6, o + momentum + (rand() - 0.5) * 1.8);
    price = c;
    return { o, c, h: Math.max(o, c) + rand() * 1.3, l: Math.min(o, c) - rand() * 1.3 };
  };

  return ({ g, t, pointer }) => {
    const W = g.cols;
    const H = g.rows;
    dotGrid(g);

    const axisW = 20;
    const chart = { x: 3, y: 12, w: W - 6 - axisW, h: H - 12 - 7 };
    const pitch = 3;
    const count = Math.max(8, Math.floor(chart.w / pitch));

    const s = Math.floor(t / 0.32);
    if (!candles.length) for (let i = 0; i < count; i++) candles.push(next());
    while (step < s) {
      step++;
      candles.push(next());
    }
    while (candles.length > count) candles.shift();

    let lo = Infinity;
    let hi = -Infinity;
    for (const k of candles) {
      lo = Math.min(lo, k.l);
      hi = Math.max(hi, k.h);
    }
    const pad = (hi - lo) * 0.12 + 0.5;
    lo -= pad;
    hi += pad;
    const y = (v: number) => Math.round(chart.y + (1 - (v - lo) / (hi - lo)) * chart.h);

    for (let i = 0; i <= 3; i++) {
      const gy = Math.round(chart.y + (i / 3) * chart.h);
      for (let x = chart.x; x < chart.x + chart.w; x += 2) g.px(x, gy, C.GRID);
    }

    candles.forEach((k, i) => {
      const x = chart.x + i * pitch;
      const up = k.c >= k.o;
      g.line(x, y(k.h), x, y(k.l), up ? C.T2 : C.W1);
      const top = y(Math.max(k.o, k.c));
      const bottom = y(Math.min(k.o, k.c));
      g.rect(x, top, 2, Math.max(1, bottom - top + 1), up ? C.T3 : C.W2);
    });

    const last = candles[candles.length - 1];
    const ly = y(last.c);
    for (let x = chart.x; x < chart.x + chart.w; x += 3) g.px(x, ly, C.N2);
    tag(g, chart.x + chart.w + 2, ly - 4, last.c.toFixed(1), C.INK, last.c >= last.o ? C.T2 : C.W1);

    const first = candles[0];
    const change = ((last.c - first.o) / first.o) * 100;
    const label = `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
    g.text(2, 2, "ATTENTION", C.N2);
    g.text(W - g.textWidth(label) - 2, 2, label, change >= 0 ? C.T3 : C.W2);

    if (pointer && pointer.x >= chart.x && pointer.x < chart.x + chart.w && pointer.y >= chart.y && pointer.y <= chart.y + chart.h) {
      const i = Math.min(candles.length - 1, Math.max(0, Math.floor((pointer.x - chart.x) / pitch)));
      const x = chart.x + i * pitch;
      for (let yy = chart.y; yy <= chart.y + chart.h; yy += 2) g.px(x, yy, C.N3);
      const py = Math.round(pointer.y);
      for (let xx = chart.x; xx < chart.x + chart.w; xx += 2) g.px(xx, py, C.N3);
      tag(g, x + 3, chart.y + 1, candles[i].c.toFixed(1));
    }
  };
}
