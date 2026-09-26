import { C, clamp01, dotGrid, pad2, rng, tag, type Scene } from "./engine";

type Access = { page: number; frame: number; start: number; fault: boolean };

/**
 * Project eXPOS: a process touches virtual pages. Hits follow the page table to a
 * frame; misses fault, take a free frame and update the table.
 * Hover a frame to see who owns it.
 */
export function expos(seed = 9): Scene {
  let key = "";
  let rand = rng(seed);
  let owner: number[] = [];
  let table: number[] = [];
  let access: Access | null = null;
  let tick = -1;
  let faults = 6;
  let hits = 23;
  let gridCols = 8;
  let gridRows = 5;

  const layout = (frames: number, pages: number) => {
    rand = rng(seed);
    owner = Array.from({ length: frames }, () => {
      const r = rand();
      return r < 0.32 ? 1 : r < 0.55 ? 2 : 0;
    });
    const mine = owner.map((o, i) => (o === 1 ? i : -1)).filter((i) => i >= 0);
    table = Array.from({ length: pages }, (_, i) => (i % 3 === 2 || !mine.length ? -1 : mine[(i * 5) % mine.length]));
  };

  return ({ g, t, pointer }) => {
    const W = g.cols;
    const H = g.rows;
    dotGrid(g);

    const tableX = 3;
    const tableW = Math.max(26, Math.round(W * 0.3));
    const rowH = 7;
    const pages = Math.max(3, Math.min(7, Math.floor((H - 16) / rowH)));
    const regionX = tableX + tableW + Math.max(6, Math.round(W * 0.07));
    const fw = W >= 150 ? 6 : 5;
    const fh = fw - 1;
    gridCols = Math.max(4, Math.min(14, Math.floor((W - regionX - 2) / (fw + 1))));
    gridRows = Math.max(3, Math.min(7, Math.floor((H - 22) / (fh + 1))));
    const frames = gridCols * gridRows;
    const gridX = regionX + Math.floor((W - regionX - 2 - gridCols * (fw + 1)) / 2);
    const gridY = 12 + Math.max(0, Math.floor((H - 22 - gridRows * (fh + 1)) / 2));

    const k = `${frames}:${pages}`;
    if (k !== key) {
      key = k;
      layout(frames, pages);
      access = null;
    }

    const framePos = (f: number) => ({ x: gridX + (f % gridCols) * (fw + 1), y: gridY + Math.floor(f / gridCols) * (fh + 1) });
    const rowY = (p: number) => 13 + p * rowH;

    // New access every 0.8s.
    const step = Math.floor(t / 0.8);
    if (step !== tick) {
      tick = step;
      const page = Math.floor(rand() * pages);
      if (table[page] >= 0) {
        access = { page, frame: table[page], start: t, fault: false };
        hits++;
      } else {
        let free = owner.findIndex((o, i) => o === 0 && !table.includes(i));
        if (free < 0) free = owner.findIndex((o) => o === 2);
        if (free < 0) free = Math.floor(rand() * frames);
        table.forEach((f, i) => {
          if (f === free) table[i] = -1;
        });
        owner[free] = 1;
        table[page] = free;
        access = { page, frame: free, start: t, fault: true };
        faults++;
      }
      // Evict something now and then so faults keep happening.
      if (step % 4 === 0) {
        const victim = Math.floor(rand() * pages);
        if (victim !== page && table[victim] >= 0) {
          owner[table[victim]] = 0;
          table[victim] = -1;
        }
      }
    }

    let hoverFrame = -1;
    if (pointer) {
      const col = Math.floor((pointer.x - gridX) / (fw + 1));
      const row = Math.floor((pointer.y - gridY) / (fh + 1));
      if (col >= 0 && row >= 0 && col < gridCols && row < gridRows) hoverFrame = row * gridCols + col;
    }
    const hoverPage = hoverFrame >= 0 ? table.indexOf(hoverFrame) : -1;

    g.text(tableX, 3, "PAGE TABLE", C.N2);
    g.text(gridX, 3, "MEMORY", C.N2);

    // Connection for the current access (or the hovered mapping).
    const age = access ? t - access.start : 9;
    const link = hoverPage >= 0 ? { page: hoverPage, frame: hoverFrame } : access && age < 0.75 ? access : null;
    if (link) {
      const p = framePos(link.frame);
      g.line(tableX + tableW, rowY(link.page) + 2, p.x - 1, p.y + 1, C.T3, 2, Math.floor(t * 12));
    }

    // Page table rows.
    for (let p = 0; p < pages; p++) {
      const y = rowY(p);
      const active = link?.page === p;
      const faulting = access?.fault && access.page === p && age < 0.6;
      g.rect(tableX, y - 1, tableW, rowH - 1, active ? C.N1 : C.NONE);
      g.text(tableX + 2, y, `V${p}`, active ? C.INK : C.N3);
      const f = table[p];
      const value = faulting && age < 0.3 ? "--" : f >= 0 ? `F${pad2(f)}` : "--";
      g.text(tableX + tableW - g.textWidth(value) - 2, y, value, faulting ? C.W3 : f >= 0 ? C.T3 : C.N2);
    }
    g.frame(tableX - 1, 11, tableW + 2, pages * rowH + 2, C.N2);

    // Physical frames.
    for (let f = 0; f < frames; f++) {
      const { x, y } = framePos(f);
      const o = owner[f];
      if (o === 1) g.rect(x, y, fw, fh, C.T2);
      else if (o === 2) g.rect(x, y, fw, fh, C.W1);
      else g.frame(x, y, fw, fh, C.N1);
    }
    if (access && age < 0.7) {
      const { x, y } = framePos(access.frame);
      if (access.fault) {
        const fill = Math.round(clamp01(age / 0.35) * fh);
        g.rect(x, y, fw, fh, C.N1);
        g.rect(x, y, fw, fill, C.W3);
      }
      g.frame(x - 1, y - 1, fw + 2, fh + 2, access.fault ? C.W3 : C.T4);
    }
    if (hoverFrame >= 0) {
      const { x, y } = framePos(hoverFrame);
      g.frame(x - 1, y - 1, fw + 2, fh + 2, C.INK);
      const o = owner[hoverFrame];
      tag(g, x + fw + 2, y - 10, `F${pad2(hoverFrame)} ${o === 1 ? "P1" : o === 2 ? "P2" : "FREE"}`);
    }

    // Legend and counters.
    const legendY = H - 7;
    g.rect(gridX, legendY + 1, 3, 3, C.T2);
    g.text(gridX + 5, legendY, "P1", C.N3);
    g.rect(gridX + 16, legendY + 1, 3, 3, C.W1);
    g.text(gridX + 21, legendY, "P2", C.N3);
    const counter = `FAULTS ${pad2(faults)}`;
    g.text(tableX, legendY, counter, access?.fault && age < 0.6 ? C.W3 : C.N3);
    if (W - gridX > 60) g.text(W - g.textWidth(`HITS ${hits}`) - 2, legendY, `HITS ${hits}`, C.N3);
  };
}
