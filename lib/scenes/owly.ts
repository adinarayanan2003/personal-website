import { BAYER_8, C, clamp01, dotGrid, ease, pad2, tag, type Gfx, type Scene } from "./engine";

const LOOP = 10.5;
const BRIEF = "A 30S LAUNCH AD";
const CHIPS = ["30 SEC", "9:16", "CINEMATIC"];

/**
 * Owly: a brief turns into a storyboard, the storyboard renders into a video, and it
 * ships. Hover a storyboard frame to pick it up.
 */
export function owly(): Scene {
  return ({ g, t, pointer }) => {
    const W = g.cols;
    const H = g.rows;
    const lt = t % LOOP;
    dotGrid(g);

    // Size the storyboard first (portrait frames, like the 9:16 option), then center
    // the whole composition so it sits well in wide and tall panels alike.
    const count = 4;
    const gap = 3;
    const compact = H < 90;
    const chipsH = compact ? 0 : 2 + 9 + 6;
    const chrome = 12 + chipsH + 3 + 8 + 6 + 5; // brief, chips, labels, render bar
    let fw = Math.floor((W - 8 - gap * (count - 1)) / count);
    let fh = Math.round(fw * 1.6);
    const maxH = H - chrome - 6;
    if (fh > maxH) {
      // Short panel: let the frames get squarer rather than tiny.
      fh = maxH;
      fw = Math.min(fw, Math.max(8, Math.round(fh / 1.25)));
    }
    const rowW = fw * count + gap * (count - 1);
    const startX = Math.round((W - rowW) / 2);
    const oy = Math.max(3, Math.round((H - (chrome + fh)) / 2));

    // Brief box with typing. Never narrower than the brief itself.
    const boxW = Math.min(W - 4, Math.max(rowW, g.textWidth(BRIEF) + 10));
    const box = { x: Math.round((W - boxW) / 2), y: oy, w: boxW, h: 12 };
    g.rect(box.x, box.y, box.w, box.h, C.N1);
    g.frame(box.x, box.y, box.w, box.h, lt < 2.4 ? C.T2 : C.N2);
    const typed = BRIEF.slice(0, Math.floor(clamp01(lt / 1.6) * BRIEF.length));
    g.text(box.x + 3, box.y + 4, typed, C.INK);
    if (lt < 2.4 && Math.floor(t * 3) % 2 === 0) g.rect(box.x + 4 + g.textWidth(typed || " "), box.y + 4, 2, 5, C.T3);

    let cx = box.x;
    CHIPS.forEach((chip, i) => {
      if (compact || lt < 1.7 + i * 0.2) return;
      const w = g.textWidth(chip) + 6;
      if (cx + w > box.x + box.w) return;
      g.frame(cx, box.y + box.h + 2, w, 9, C.T2);
      g.text(cx + 3, box.y + box.h + 4, chip, C.T3);
      cx += w + 3;
    });

    const top = box.y + box.h + chipsH + 3;

    let hover = -1;
    for (let i = 0; i < count; i++) {
      const x = startX + i * (fw + gap);
      if (pointer && pointer.x >= x && pointer.x < x + fw && pointer.y >= top - 2 && pointer.y < top + fh + 2) hover = i;
    }

    for (let i = 0; i < count; i++) {
      const appear = 2.4 + i * 0.55;
      if (lt < appear) {
        g.frame(startX + i * (fw + gap), top, fw, fh, C.N1);
        continue;
      }
      const lift = hover === i ? 2 : 0;
      const x = startX + i * (fw + gap);
      const y = top - lift;
      const reveal = clamp01((lt - appear) / 0.45);
      drawBoard(g, i, x + 1, y + 1, fw - 2, fh - 2, t, reveal);
      g.frame(x, y, fw, fh, hover === i ? C.INK : C.N2);
      g.text(x, y + fh + 2, pad2(i + 1), hover === i ? C.INK : C.N3);
    }
    if (hover >= 0 && lt > 2.4 + hover * 0.55) {
      tag(g, startX + hover * (fw + gap) + fw - 6, top - 12, `SCENE ${pad2(hover + 1)}`);
    }

    // Render and publish.
    const barY = top + fh + 8 + 6;
    const render = clamp01((lt - 5.2) / 2.6);
    if (lt > 5.2) {
      const label = render < 1 ? `RENDER ${Math.round(render * 100)}%` : "PUBLISHED";
      const lw = g.textWidth("RENDER 100%");
      const bx = startX + lw + 4;
      const bw = startX + rowW - bx - 10;
      g.text(startX, barY, label, render < 1 ? C.N3 : C.T4);
      g.rect(bx, barY + 2, bw, 1, C.N1);
      for (let i = 0; i < count; i++) {
        const segW = Math.floor(bw / count);
        const segX = bx + i * segW;
        const fill = clamp01(render * count - i);
        if (fill > 0) g.rect(segX, barY + 1, Math.max(1, Math.round((segW - 1) * fill)), 3, [C.W2, C.T2, C.N3, C.T3][i]);
      }
      if (render >= 1) {
        // Check mark.
        const x = startX + rowW - 7;
        const y = barY - 1;
        [[0, 3], [1, 4], [2, 5], [3, 4], [4, 3], [5, 2], [6, 1]].forEach(([dx, dy]) => g.px(x + dx, y + dy, C.T4));
      }
    }
  };
}

/** Four tiny storyboard compositions. */
function drawBoard(g: Gfx, i: number, x: number, y: number, w: number, h: number, t: number, reveal: number) {
  const hidden = (xx: number, yy: number) => BAYER_8[((yy & 7) << 3) | (xx & 7)] > reveal;
  const put = (xx: number, yy: number, c: number) => {
    if (!hidden(xx, yy)) g.px(xx, yy, c);
  };
  const fill = (x0: number, y0: number, ww: number, hh: number, c: number) => {
    for (let yy = y0; yy < y0 + hh; yy++) for (let xx = x0; xx < x0 + ww; xx++) put(xx, yy, c);
  };

  if (i === 0) {
    // Sunrise over hills.
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        const v = 0.25 + (yy / h) * 0.7;
        const q = v * 2;
        const level = (q | 0) + (q - (q | 0) > BAYER_8[(((y + yy) & 7) << 3) | ((x + xx) & 7)] ? 1 : 0);
        if (level > 0) put(x + xx, y + yy, level >= 2 ? C.W2 : C.W1);
      }
    }
    const r = Math.max(2, Math.round(w * 0.16));
    const sx = x + Math.round(w * 0.55);
    const sy = y + Math.round(h * 0.55 - Math.sin(t) * 1.5);
    for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r + r) put(sx + xx, sy + yy, C.W3);
    fill(x, y + Math.round(h * 0.72), w, h - Math.round(h * 0.72), C.N1);
  } else if (i === 1) {
    // Product on a plinth under a spotlight.
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        const d = Math.hypot(xx - w / 2, yy - h * 0.35) / (Math.max(w, h) * 0.7);
        if (d < 1 && BAYER_8[(((y + yy) & 7) << 3) | ((x + xx) & 7)] < (1 - d) * 0.9) put(x + xx, y + yy, C.T1);
      }
    }
    const bw = Math.max(4, Math.round(w * 0.46));
    const bh = Math.max(4, Math.round(h * 0.3));
    const bx = x + ((w - bw) >> 1);
    const by = y + Math.round(h * 0.34);
    fill(bx, by, bw, bh, C.T2);
    fill(bx, by, bw, 1, C.T4);
    fill(x + Math.round(w * 0.2), by + bh, Math.round(w * 0.6), Math.max(2, Math.round(h * 0.12)), C.N2);
  } else if (i === 2) {
    // Person on camera.
    fill(x, y, w, h, C.N1);
    const hx = x + (w >> 1);
    const hy = y + Math.round(h * 0.38);
    const r = Math.max(2, Math.round(w * 0.17));
    for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r + r) put(hx + xx, hy + yy, C.N3);
    const sw = Math.round(w * 0.64);
    fill(x + ((w - sw) >> 1), hy + r + 2, sw, y + h - (hy + r + 2), C.N2);
    if (Math.floor(t * 2) % 2 === 0) put(x + w - 3, y + 2, C.W3);
  } else {
    // End card with a call to action.
    const word = "SHOP";
    const tw = g.textWidth(word);
    const tx = x + Math.round((w - tw) / 2);
    const ty = y + Math.round(h * 0.34);
    if (reveal > 0.5 && w >= tw + 2) g.text(tx, ty, word, C.INK);
    const bw = Math.min(w - 2, tw + 4);
    fill(x + Math.round((w - bw) / 2), ty + 8, bw, 3, C.T3);
  }

  if (reveal < 1) {
    const flash = ease(1 - reveal);
    if (flash > 0.6) g.frame(x - 1, y - 1, w + 2, h + 2, C.T4);
  }
}
