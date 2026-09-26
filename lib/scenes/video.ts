import { C, clamp01, dotGrid, ease, type Gfx, type Scene } from "./engine";

const LOOP = 12;
const COMMANDS = [
  { at: 0.8, text: "TRIM CLIP A" },
  { at: 2.4, text: "CUT AT 0:04" },
  { at: 4.0, text: "ADD TITLE" },
  { at: 5.6, text: "COLOR WARM" },
  { at: 7.2, text: "EXPORT" },
];

type Clip = { id: string; from: number; to: number; color: number };

/**
 * Agentic Video Editor: an agent sends plain-language commands and the timeline
 * changes to match. Move across the scene to scrub the playhead.
 */
export function video(): Scene {
  return ({ g, t, pointer }) => {
    const W = g.cols;
    const H = g.rows;
    const lt = t % LOOP;
    const done = (i: number) => lt >= COMMANDS[i].at + 0.35;
    const mix = (i: number) => ease((lt - COMMANDS[i].at - 0.1) / 0.4);

    dotGrid(g);

    // Timeline state from the commands issued so far.
    const trim = mix(0);
    const a: Clip = { id: "A", from: 0, to: 0.38 - 0.08 * trim, color: done(3) ? C.W2 : C.T2 };
    const shiftX = -0.08 * trim;
    const cut = done(1);
    const clips: Clip[] = [
      a,
      ...(cut
        ? [
            { id: "B", from: 0.4 + shiftX, to: 0.55 + shiftX, color: C.N2 },
            { id: "B", from: 0.57 + shiftX, to: 0.72 + shiftX, color: C.N2 },
          ]
        : [{ id: "B", from: 0.4 + shiftX, to: 0.72 + shiftX, color: C.N2 }]),
      { id: "C", from: 0.74 + shiftX, to: 1 + shiftX, color: C.T1 },
    ];
    const title = done(2) ? { from: 0.04, to: 0.04 + 0.22 * mix(2) } : null;

    const mon = { x: 3, y: 3, w: Math.round(W * 0.58), h: Math.round(H * 0.52) };
    const tl = { x: 12, y: Math.round(H * 0.66), w: W - 15, h: H - Math.round(H * 0.66) - 3 };

    // Playhead: follows the pointer when it's over the scene, otherwise plays.
    let head = (t * 0.11) % 1;
    if (pointer) head = clamp01((pointer.x - tl.x) / tl.w);
    const headX = Math.round(tl.x + head * tl.w);
    const under =
      clips.find((c) => head >= c.from && head <= c.to) ??
      clips.reduce((best, c) => (Math.abs((c.from + c.to) / 2 - head) < Math.abs((best.from + best.to) / 2 - head) ? c : best));

    // Monitor.
    g.rect(mon.x, mon.y, mon.w, mon.h, C.NONE);
    drawShot(g, mon.x + 1, mon.y + 1, mon.w - 2, mon.h - 2, under.id, under === a && done(3), t);
    if (title && head >= title.from && head <= title.to) {
      const text = "LAUNCH";
      const tw = g.textWidth(text);
      g.rect(mon.x + ((mon.w - tw) >> 1) - 2, mon.y + 3, tw + 4, 9, C.N1);
      g.text(mon.x + ((mon.w - tw) >> 1), mon.y + 5, text, C.INK);
    }
    g.frame(mon.x, mon.y, mon.w, mon.h, C.N2);

    // Agent command log.
    const logX = mon.x + mon.w + 4;
    g.text(logX, 4, "AGENT", C.N2);
    let y = 12;
    COMMANDS.forEach((cmd, i) => {
      if (lt < cmd.at) return;
      const latest = i === COMMANDS.length - 1 || lt < COMMANDS[i + 1].at;
      const max = Math.floor((W - logX - 6) / 4);
      const text = cmd.text.length > max ? cmd.text.slice(0, max) : cmd.text;
      g.text(logX, y, ">", latest ? C.T4 : C.T2);
      g.text(logX + 4, y, text, latest ? C.INK : C.N3);
      if (latest && Math.floor(t * 3) % 2 === 0) g.rect(logX + 5 + g.textWidth(text), y, 2, 5, C.T3);
      y += 8;
    });

    // Export progress.
    if (lt > COMMANDS[4].at + 0.3) {
      const p = clamp01((lt - COMMANDS[4].at - 0.3) / 3);
      const bw = mon.w - 8;
      g.rect(mon.x + 4, mon.y + mon.h - 5, bw, 2, C.N1);
      g.rect(mon.x + 4, mon.y + mon.h - 5, Math.round(bw * p), 2, p >= 1 ? C.T4 : C.T3);
    }

    // Timeline: ruler, video track, audio track, title track.
    for (let x = 0; x <= tl.w; x += 4) g.px(tl.x + x, tl.y, x % 16 === 0 ? C.N3 : C.N2);
    const trackH = Math.max(4, Math.round(tl.h * 0.34));
    const v1 = tl.y + 3;
    const a1 = v1 + trackH + 2;
    const t1 = a1 + Math.max(3, trackH - 1) + 2;
    g.text(2, v1, "V", C.N3);
    g.text(2, a1, "A", C.N3);
    if (t1 + 3 < H) g.text(2, t1 - 1, "T", C.N3);

    for (const clip of clips) {
      const x0 = Math.round(tl.x + clip.from * tl.w);
      const x1 = Math.round(tl.x + clip.to * tl.w);
      g.rect(x0, v1, Math.max(1, x1 - x0), trackH, clip.color);
      g.rect(x0, v1, 1, trackH, C.N3);
    }
    if (cut) {
      const cx = Math.round(tl.x + (0.56 + shiftX) * tl.w);
      if (lt < COMMANDS[1].at + 0.9) g.rect(cx, v1 - 1, 1, trackH + 2, C.W3);
    }
    const aH = Math.max(3, trackH - 1);
    for (let x = 0; x < tl.w; x += 2) {
      const amp = Math.abs(Math.sin(x * 0.37) * Math.cos(x * 0.13 + 1.3));
      const h = Math.max(1, Math.round(amp * aH));
      g.rect(tl.x + x, a1 + aH - h, 1, h, C.T1);
    }
    if (title && t1 + 3 < H) {
      const x0 = Math.round(tl.x + title.from * tl.w);
      g.rect(x0, t1, Math.max(1, Math.round((title.to - title.from) * tl.w)), 3, C.N3);
    }

    // Playhead on top.
    g.rect(headX, tl.y - 2, 1, H - tl.y + 1, C.INK);
    g.rect(headX - 1, tl.y - 3, 3, 2, C.INK);
  };
}

/** What the monitor shows for each clip. */
function drawShot(g: Gfx, x: number, y: number, w: number, h: number, id: string, warm: boolean, t: number) {
  if (id === "A") {
    const sky = warm ? [C.W1, C.W2] : [C.T1, C.T2];
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) g.shade(x + xx, y + yy, 0.2 + (yy / h) * 0.75, sky);
    const sunX = x + Math.round(w * 0.62);
    const sunY = y + Math.round(h * 0.52 - Math.sin(t * 0.8) * 2);
    g.disc(sunX, sunY, Math.max(3, Math.round(h * 0.13)), warm ? C.W3 : C.T4);
    const horizon = y + Math.round(h * 0.7);
    g.rect(x, horizon, w, y + h - horizon, C.N1);
    for (let xx = 0; xx < w; xx++) {
      const hill = Math.round(Math.sin(xx * 0.11) * 2 + Math.sin(xx * 0.05 + 1) * 2);
      g.rect(x + xx, horizon - 2 - hill, 1, 3 + hill, C.N2);
    }
  } else if (id === "B") {
    g.rect(x, y, w, h, C.N1);
    let xx = 1;
    let i = 0;
    while (xx < w - 2) {
      const bw = 4 + ((i * 7) % 5);
      const bh = Math.round(h * (0.3 + ((i * 13) % 7) / 12));
      g.rect(x + xx, y + h - bh, Math.min(bw, w - xx - 1), bh, C.N2);
      for (let wy = y + h - bh + 2; wy < y + h - 2; wy += 3) {
        for (let wx = x + xx + 1; wx < x + xx + bw - 1 && wx < x + w - 1; wx += 2) {
          if ((wx * 7 + wy * 3 + Math.floor(t * 2)) % 5 === 0) g.px(wx, wy, C.T3);
        }
      }
      xx += bw + 1;
      i++;
    }
  } else if (id === "C") {
    g.rect(x, y, w, h, C.NONE);
    g.glow(x + w / 2, y + h * 0.45, Math.min(w, h) * 0.55, 0.7, [C.T1, C.T2]);
    const bw = Math.round(w * 0.22);
    const bh = Math.round(h * 0.34);
    const bx = x + ((w - bw) >> 1);
    const by = y + Math.round(h * 0.28);
    g.rect(bx, by, bw, bh, C.N2);
    g.frame(bx, by, bw, bh, C.INK);
    g.rect(x + Math.round(w * 0.25), by + bh, Math.round(w * 0.5), 2, C.N3);
  } else {
    g.rect(x, y, w, h, C.N1);
  }
}
