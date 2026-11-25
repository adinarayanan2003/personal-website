import { C, clamp01, dotGrid, pad2, rng, tag } from "@/lib/scenes/engine";

import { drawPips } from "./sarcophagus";
import type { Game, GameFrame } from "./types";

/**
 * Page fault: eight physical frames, a stream of page requests with locality. Hits
 * score on their own; on a fault you pick the frame to evict before the countdown ends.
 * The dimmest frame is the least recently used, and evicting it scores extra.
 */

const FRAMES = 8;
const PAGES = 24;
const WS = 5;
const STRIKES = 3;
const QUEUE_MAX = 6;

type Frame = { page: number; used: number; usedAt: number; loadedAt: number; hitAt: number };
type Request = { page: number; start: number; limit: number };

export function createExpos(seed: number): Game {
  const rand = rng(seed);
  let t = 0;
  let score = 0;
  let strikes = 0;
  let overAt = -1;
  let seq = 0;
  let center = Math.floor(rand() * PAGES);
  let lastReq = -1;

  // Start with five pages of the working set loaded and three frames empty.
  const frames: Frame[] = Array.from({ length: FRAMES }, () => ({ page: -1, used: 0, usedAt: -9, loadedAt: -9, hitAt: -9 }));
  const slots = Array.from({ length: FRAMES }, (_, i) => i);
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  for (let i = 0; i < 5; i++) {
    frames[slots[i]].page = (center - 1 + i + PAGES) % PAGES;
    frames[slots[i]].used = ++seq;
    frames[slots[i]].usedAt = -(5 - i) * 0.9;
  }

  const queue: number[] = [];
  let current: Request | null = null;
  let busyUntil = 0;
  let nextArrival = 0.4;
  let note = { text: "", at: -9, color: C.T4 as number, frame: -1 };
  let evicted = { page: -1, frame: -1, at: -9 };
  let strikeAt = -9;

  const nextPage = () => {
    for (let tries = 0; tries < 4; tries++) {
      // The working set drifts forward slowly; now and then a stray page comes in.
      if (rand() < 0.2) center = (center + (rand() < 0.8 ? 1 : -1) + PAGES) % PAGES;
      const p = rand() < 0.1 ? Math.floor(rand() * PAGES) : (center + Math.floor(rand() * WS)) % PAGES;
      if (p !== lastReq) return (lastReq = p);
    }
    return lastReq;
  };

  const lruFrame = () => {
    const empty = frames.findIndex((f) => f.page < 0);
    if (empty >= 0) return empty;
    let best = 0;
    for (let i = 1; i < FRAMES; i++) if (frames[i].used < frames[best].used) best = i;
    return best;
  };

  const choose = (i: number) => {
    if (!current || overAt >= 0 || i < 0 || i >= FRAMES) return;
    const f = frames[i];
    const wasEmpty = f.page < 0;
    const lru = lruFrame();
    const best = i === lru || wasEmpty;
    if (!wasEmpty) evicted = { page: f.page, frame: i, at: t };
    frames[i] = { page: current.page, used: ++seq, usedAt: t, loadedAt: t, hitAt: -9 };
    score += best ? 2 : 1;
    note = best
      ? { text: wasEmpty ? "FREE!" : "LRU!", at: t, color: C.T4, frame: i }
      : { text: "+1", at: t, color: C.INK, frame: i };
    current = null;
    busyUntil = t + 0.15;
  };

  return {
    score: () => score,
    over: () => overAt >= 0 && t - overAt > 0.7,
    step({ g, dt, pointer, clicks, keys }: GameFrame) {
      t += dt;
      const W = g.cols;
      const H = g.rows;
      const live = overAt < 0;

      // Layout: one row of eight frames, or two rows of four when narrow.
      const gap = W >= 140 ? 3 : 2;
      const oneRow = (W - 4 - 7 * gap) / 8 >= 10;
      const perRow = oneRow ? 8 : 4;
      const fw = Math.min(oneRow ? 17 : 22, Math.floor((W - 4 - (perRow - 1) * gap) / perRow));
      const fy0 = H >= 80 ? 30 : 24;
      const rowsN = oneRow ? 1 : 2;
      const avail = H - 9 - fy0 - rowsN * 8;
      const fh = Math.max(9, Math.min(oneRow ? 26 : 14, Math.floor(avail / rowsN)));
      const gridW = perRow * fw + (perRow - 1) * gap;
      const gx = Math.round((W - gridW) / 2);
      const fy = fy0 + Math.max(0, Math.floor((avail - rowsN * fh) / 2) - 2);
      const pos = (i: number) => ({
        x: gx + (i % perRow) * (fw + gap),
        y: fy + Math.floor(i / perRow) * (fh + 9),
      });

      if (live) {
        // Arrivals speed up over the round.
        while (t >= nextArrival) {
          if (queue.length < QUEUE_MAX) queue.push(nextPage());
          nextArrival += Math.max(0.45, 1.0 - t * 0.017);
        }

        // Serve the head of the queue.
        if (!current && t >= busyUntil && queue.length) {
          const page = queue.shift()!;
          const at = frames.findIndex((f) => f.page === page);
          if (at >= 0) {
            frames[at].used = ++seq;
            frames[at].hitAt = t;
            frames[at].usedAt = t;
            score += 1;
            note = { text: "HIT +1", at: t, color: C.T3, frame: -1 };
            busyUntil = t + 0.18;
          } else current = { page, start: t, limit: Math.max(1.5, 2.6 - t * 0.03) };
        }

        // Pick a frame by click or number key.
        for (const c of clicks) {
          for (let i = 0; i < FRAMES; i++) {
            const p = pos(i);
            if (c.x >= p.x - 1 && c.x < p.x + fw + 1 && c.y >= p.y - 1 && c.y < p.y + fh + 8) choose(i);
          }
        }
        for (const k of keys) if (k >= "1" && k <= "8") choose(Number(k) - 1);

        if (current && t - current.start > current.limit) {
          strikes++;
          strikeAt = t;
          note = { text: "TOO SLOW", at: t, color: C.W3, frame: -1 };
          current = null;
          busyUntil = t + 0.3;
          if (strikes >= STRIKES) overAt = t;
        }
      }

      dotGrid(g);

      // HUD.
      g.text(2, 2, "SCORE", C.N3);
      g.text(2 + g.textWidth("SCORE "), 2, String(score), C.INK);
      drawPips(g, W, STRIKES, strikes, t - strikeAt < 0.5);

      // Current request, with its countdown.
      const ry = 11;
      const fault = !!current;
      const label = current ? `PAGE ${pad2(current.page)}` : "PAGE --";
      const plateW = g.textWidth(label) + 4;
      const blink = fault && Math.floor(t * 6) % 2 === 0;
      g.rect(2, ry, plateW, 9, fault ? C.W1 : C.N1);
      g.text(4, ry + 2, label, fault ? C.W3 : C.N2);
      if (fault) g.frame(1, ry - 1, plateW + 2, 11, blink ? C.W3 : C.W2);
      if (current) {
        const left = clamp01(1 - (t - current.start) / current.limit);
        g.rect(2, ry + 10, Math.round(plateW * left), 1, left < 0.35 ? C.W3 : C.W2);
        g.text(plateW + 6, ry + 2, "FAULT", C.W3);
      } else if (t - note.at < 0.5 && note.text === "HIT +1") {
        g.text(plateW + 6, ry + 2, "HIT", C.T4);
      }

      // Upcoming requests, newest on the right.
      const qx0 = plateW + 6 + g.textWidth("FAULT") + 6;
      const room = Math.floor((W - 2 - qx0 + 1) / 12);
      const shown = queue.slice(0, Math.max(0, room));
      shown.forEach((p, i) => {
        const x = W - 2 - (shown.length - i) * 12 + 2;
        g.text(x, ry + 2, pad2(p), i === 0 ? C.N3 : C.N2);
      });
      if (shown.length && W - qx0 > 40) g.text(W - 2 - shown.length * 12 - g.textWidth("NEXT") - 1, ry + 2, "NEXT", C.N2);

      // Frames, shaded by recency: the newest is brightest, the least recently used dimmest.
      const order = frames
        .map((f, i) => ({ i, used: f.used, empty: f.page < 0 }))
        .filter((f) => !f.empty)
        .sort((a, b) => b.used - a.used);
      const rank = new Array(FRAMES).fill(-1);
      order.forEach((o, r) => (rank[o.i] = r));
      let hover = -1;
      if (pointer && fault) {
        for (let i = 0; i < FRAMES; i++) {
          const p = pos(i);
          if (pointer.x >= p.x - 1 && pointer.x < p.x + fw + 1 && pointer.y >= p.y - 1 && pointer.y < p.y + fh + 8) hover = i;
        }
      }
      for (let i = 0; i < FRAMES; i++) {
        const { x, y } = pos(i);
        const f = frames[i];
        if (f.page < 0) {
          g.rect(x, y, fw, fh, C.N1);
          g.frame(x, y, fw, fh, C.N2);
          g.text(x + Math.round((fw - 7) / 2), y + Math.round((fh - 5) / 2), "--", C.N2);
        } else {
          const v = order.length > 1 ? 1 - (rank[i] / (order.length - 1)) * 0.82 : 1;
          for (let yy = 0; yy < fh; yy++) for (let xx = 0; xx < fw; xx++) g.shade(x + xx, y + yy, v, [C.T1, C.T2, C.T3]);
          const load = t - f.loadedAt;
          if (load < 0.35) g.rect(x, y, fw, Math.round(clamp01(load / 0.3) * fh), C.W3);
          const txt = pad2(f.page);
          const tx = x + Math.round((fw - 7) / 2);
          const ty = y + Math.round((fh - 5) / 2);
          g.rect(tx - 1, ty - 1, 9, 7, C.N1);
          g.text(tx, ty, txt, C.INK);
          // Age meter along the bottom: seconds since this page was last touched.
          const age = clamp01((t - f.usedAt) / 10);
          const ah = fh >= 18 ? 2 : 1;
          g.rect(x, y + fh - ah, fw, ah, C.N1);
          if (age > 0) g.rect(x, y + fh - ah, Math.max(1, Math.round(fw * age)), ah, age > 0.6 ? C.W3 : C.W2);
        }
        const hit = t - f.hitAt < 0.35;
        const loaded = t - f.loadedAt < 0.5;
        if (hover === i) g.frame(x - 1, y - 1, fw + 2, fh + 2, C.INK);
        else if (hit) g.frame(x - 1, y - 1, fw + 2, fh + 2, C.T4);
        else if (loaded) g.frame(x - 1, y - 1, fw + 2, fh + 2, C.W3);
        const key = String(i + 1);
        g.text(x + Math.round((fw - 3) / 2), y + fh + 2, key, hover === i ? C.INK : fault ? C.N3 : C.N2);
      }

      // An evicted page drops out under its frame.
      if (t - evicted.at < 0.45) {
        const { x, y } = pos(evicted.frame);
        const drop = Math.round((t - evicted.at) * 20);
        const ey = y + fh + 9 + drop;
        if (ey + 5 < H - 8) g.text(x + Math.round((fw - 7) / 2), ey, pad2(evicted.page), C.N2);
      }

      // Feedback tag above the frame that scored.
      if (note.frame >= 0 && t - note.at < 0.7) {
        const { x, y } = pos(note.frame);
        const w = g.textWidth(note.text) + 4;
        tag(g, x + Math.round((fw - w) / 2), y - 10, note.text, note.color, C.N1);
      }

      // Bottom line.
      let msg = W >= 140 ? "DIM = LEAST RECENTLY USED" : "DIM = OLDEST";
      let mc: number = C.N2;
      if (overAt >= 0) {
        msg = "OUT OF STRIKES";
        mc = C.W3;
      } else if (t - strikeAt < 0.8) {
        msg = `TOO SLOW - ${STRIKES - strikes} LEFT`;
        mc = C.W3;
      } else if (fault) {
        msg = W >= 140 ? "PICK A FRAME TO EVICT: 1-8" : "EVICT: 1-8";
        mc = C.W2;
      }
      while (msg.length && g.textWidth(msg) > W - 4) msg = msg.slice(0, -1);
      g.text(Math.round((W - g.textWidth(msg)) / 2), H - 7, msg, mc);
    },
  };
}
