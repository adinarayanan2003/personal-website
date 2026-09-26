import { C, dotGrid, ease, rng, type Scene } from "./engine";

type Line = { stub: number; len: number; tail: number; kind: 0 | 1 | 2; caught: boolean };
type Chip = { x: number; y: number; start: number; bin: number };

/**
 * DIAG AI: logs stream past a scanner. Layer 1 pulls out the errors, layer 2 routes
 * each one to the component it belongs to. Hover the log to pause it and read a line.
 */
export function diag(seed = 5): Scene {
  const rand = rng(seed);
  const lines: Line[] = [];
  const chips: Chip[] = [];
  const counts = [4, 7, 2];
  const flash = [-9, -9, -9];
  let offset = 0;
  let caught = 18;

  const make = (): Line => {
    const r = rand();
    return {
      stub: 2 + Math.floor(rand() * 2),
      len: 5 + Math.floor(rand() * 15),
      tail: rand() < 0.45 ? 2 + Math.floor(rand() * 6) : 0,
      kind: r < 0.17 ? 2 : r < 0.32 ? 1 : 0,
      caught: false,
    };
  };

  return ({ g, t, dt, pointer }) => {
    const W = g.cols;
    const H = g.rows;
    dotGrid(g);

    const logX = 3;
    const logW = Math.round(W * 0.44);
    const top = 11;
    const rowH = 3;
    const rowsVisible = Math.max(5, Math.floor((H - top - 3) / rowH));
    while (lines.length < rowsVisible + 2) lines.push(make());

    const hoverLog = !!pointer && pointer.x < logX + logW + 3 && pointer.y > top - 3;
    if (!hoverLog) offset += dt * 2.8;
    while (offset >= 1) {
      offset -= 1;
      lines.shift();
      lines.push(make());
    }
    const shift = Math.floor(offset * rowH);

    const l1 = {
      x: Math.round(W * 0.57),
      y: Math.round(H * 0.3),
      w: Math.max(24, Math.round(W * 0.16)),
      h: Math.max(14, Math.round(H * 0.4)),
    };
    const binX = Math.round(W * 0.8);
    const binW = Math.max(12, W - binX - 3);
    const binH = Math.max(9, Math.round(H * 0.17));
    const bins = [0, 1, 2].map((i) => ({ x: binX, y: Math.round(H * 0.16 + i * (binH + Math.max(3, H * 0.08))), w: binW, h: binH }));
    const bandY = top + Math.floor(rowsVisible * 0.45) * rowH;

    // Wiring first, so boxes sit on top of it.
    g.line(logX + logW + 3, bandY, l1.x - 1, l1.y + (l1.h >> 1), C.T1);
    for (const b of bins) g.line(l1.x + l1.w, l1.y + (l1.h >> 1), b.x - 1, b.y + (b.h >> 1), C.T1);

    g.text(logX, 3, "LOGS", C.N2);
    g.text(l1.x, 3, "LAYER 1", C.N2);
    g.text(binX, 3, "LAYER 2", C.N2);

    // Scanner band.
    g.rect(logX - 2, bandY - 1, logW + 4, 3, C.N1);
    g.frame(logX - 2, bandY - 2, logW + 4, 5, C.T2);

    for (let i = 0; i <= rowsVisible; i++) {
      const y = top + i * rowH - shift;
      if (y < top - 1 || y > H - 3) continue;
      const line = lines[i];
      const hovered = hoverLog && Math.abs(pointer!.y - y) < 1.6;
      const base = line.kind === 2 ? (line.caught ? C.W1 : C.W2) : line.kind === 1 ? C.N3 : C.N2;
      g.rect(logX, y, line.stub, 1, C.N1);
      g.rect(logX + line.stub + 1, y, line.len, 1, hovered ? C.INK : base);
      if (line.tail) g.rect(logX + line.stub + line.len + 2, y, line.tail, 1, hovered ? C.N3 : C.N1);
      if (line.kind === 2 && line.caught) g.px(logX + logW, y, C.T3);

      if (line.kind === 2 && !line.caught && Math.abs(y - bandY) <= 1) {
        line.caught = true;
        chips.push({ x: logX + line.stub + 1 + line.len, y, start: t, bin: Math.floor(rand() * 3) });
      }
    }

    // Layer boxes.
    g.rect(l1.x, l1.y, l1.w, l1.h, C.NONE);
    g.frame(l1.x, l1.y, l1.w, l1.h, C.N2);
    g.text(l1.x + 2, l1.y + 2, "ERR", C.W2);
    const found = String(caught);
    g.text(l1.x + l1.w - g.textWidth(found) - 2, l1.y + 2, found, C.INK);
    const inBox = chips.filter((c) => t - c.start > 0.45 && t - c.start < 0.8).length;
    for (let i = 0; i < Math.min(4, inBox + 1); i++) g.rect(l1.x + 2 + i * 3, l1.y + l1.h - 4, 2, 2, i < inBox ? C.W3 : C.N1);

    bins.forEach((b, i) => {
      const hot = t - flash[i] < 0.45;
      g.frame(b.x, b.y, b.w, b.h, hot ? C.T4 : C.N2);
      g.text(b.x + 2, b.y + 2, `C${i + 1}`, hot ? C.T4 : C.N3);
      const n = String(counts[i]);
      g.text(b.x + b.w - g.textWidth(n) - 2, b.y + 2, n, hot ? C.INK : C.N3);
    });

    // Chips travel log -> layer 1 -> component.
    for (let i = chips.length - 1; i >= 0; i--) {
      const chip = chips[i];
      const age = t - chip.start;
      const box = bins[chip.bin];
      const l1c = { x: l1.x + (l1.w >> 1), y: l1.y + (l1.h >> 1) };
      let p: { x: number; y: number };
      if (age < 0.45) p = g.lerpPoint(chip.x, chip.y, l1c.x, l1c.y, ease(age / 0.45));
      else if (age < 0.8) p = l1c;
      else if (age < 1.2) p = g.lerpPoint(l1c.x, l1c.y, box.x + 2, box.y + (box.h >> 1), ease((age - 0.8) / 0.4));
      else {
        counts[chip.bin]++;
        flash[chip.bin] = t;
        caught++;
        chips.splice(i, 1);
        continue;
      }
      if (age >= 0.45 && age < 0.8) continue;
      g.rect(p.x - 1, p.y - 1, 3, 2, C.W3);
    }

  };
}
