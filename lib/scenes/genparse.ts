import { C, dotGrid, rng, type Scene } from "./engine";

const INDENTS = [0, 1, 1, 2, 2, 1, 2, 1, 0];
const LOOP = 8;

/**
 * GenParse AI: the agent reads code line by line, builds a syntax tree, then writes
 * a patch back into the file.
 */
export function genparse(seed = 13): Scene {
  const rand = rng(seed);
  const lines = INDENTS.map((depth) => ({ depth, key: 2 + Math.floor(rand() * 3), rest: 4 + Math.floor(rand() * 12) }));

  return ({ g, t, pointer }) => {
    const W = g.cols;
    const H = g.rows;
    const lt = t % LOOP;
    dotGrid(g);

    const codeX = 3;
    const codeW = Math.round(W * 0.48);
    const rowH = Math.max(4, Math.min(6, Math.floor((H - 16) / (lines.length + 1))));
    const top = 11;
    const scanned = Math.min(lines.length, Math.floor(lt * 1.6));
    const patching = lt > lines.length / 1.6 + 0.4;
    const patchAt = 5;

    g.text(codeX, 3, "AGENT.PY", C.N2);
    g.text(Math.round(W * 0.56), 3, "AST", C.N2);

    let hoverLine = -1;
    if (pointer && pointer.x < codeX + codeW) hoverLine = Math.floor((pointer.y - top + 1) / rowH);

    // Code.
    let y = top;
    lines.forEach((line, i) => {
      if (patching && i === patchAt) {
        g.text(codeX, y - 1, "+", C.T4);
        g.rect(codeX + 5 + line.depth * 3, y + 1, 3, 1, C.T4);
        g.rect(codeX + 9 + line.depth * 3, y + 1, Math.min(codeW - 12, 10), 1, C.T3);
        y += rowH;
      }
      const lit = i === scanned - 1 && !patching;
      const hovered = i === hoverLine;
      if (lit || hovered) g.rect(codeX - 1, y - 1, codeW, 3, C.N1);
      const x = codeX + 5 + line.depth * 3;
      const read = i < scanned;
      g.rect(x, y, line.key, 1, read ? C.T3 : C.N2);
      g.rect(x + line.key + 1, y, Math.min(line.rest, codeX + codeW - x - line.key - 2), 1, hovered ? C.INK : read ? C.N3 : C.N2);
      y += rowH;
    });

    // Tree: one node per scanned line, placed by depth.
    const treeX = Math.round(W * 0.56);
    const treeW = W - treeX - 4;
    const levelY = (d: number) => top + 2 + d * Math.max(8, Math.round((H - top - 12) / 3));
    const perLevel: number[] = [0, 0, 0];
    const totalPerLevel = [0, 0, 0];
    lines.forEach((l) => totalPerLevel[l.depth]++);
    const pos = lines.map((l) => {
      const idx = perLevel[l.depth]++;
      const n = totalPerLevel[l.depth];
      return { x: treeX + Math.round(((idx + 0.5) / n) * treeW), y: levelY(l.depth) };
    });
    const parentOf = (i: number) => {
      for (let j = i - 1; j >= 0; j--) if (lines[j].depth < lines[i].depth) return j;
      return -1;
    };
    for (let i = 0; i < scanned; i++) {
      const p = parentOf(i);
      if (p >= 0) g.line(pos[p].x, pos[p].y, pos[i].x, pos[i].y, C.T1);
    }
    for (let i = 0; i < scanned; i++) {
      const isPatch = patching && i === patchAt;
      const hot = i === scanned - 1 && !patching;
      const color = isPatch ? (Math.floor(t * 4) % 2 ? C.W3 : C.T4) : hot || i === hoverLine ? C.T4 : C.T2;
      g.rect(pos[i].x - 1, pos[i].y - 1, 3, 3, color);
    }

    if (patching) g.text(treeX, H - 7, "PATCH READY", C.T4);
  };
}
