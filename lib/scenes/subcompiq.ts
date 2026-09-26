import { C, clamp01, dotGrid, ease, pad2, rng, scatter, tag, type Scene } from "./engine";

type P = { x: number; y: number };
const dist = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * SubcompIQ: a new bug enters, a query walks the graph of past bugs and components,
 * and lands on the predicted sub-component. Hover a node to see its neighborhood.
 */
export function subcompiq(seed = 3): Scene {
  let key = "";
  let nodes: P[] = [];
  let firstComp = 1;
  let edges: [number, number][] = [];
  let links: number[][] = [];
  let route = [0];
  let cycle = -1;
  let routed = 40;
  let rand = rng(seed);

  const nearest = (i: number, from: number, to: number) =>
    Array.from({ length: to - from }, (_, k) => from + k)
      .filter((j) => j !== i)
      .sort((a, b) => dist(nodes[i], nodes[a]) - dist(nodes[i], nodes[b]));

  const layout = (W: number, H: number) => {
    rand = rng(seed);
    const bug = { x: Math.round(W * 0.12), y: Math.round(H * 0.52) };
    const past = scatter(rand, 6, { x0: W * 0.3, y0: H * 0.2, x1: W * 0.46, y1: H * 0.82 }, Math.max(6, H * 0.15));
    const comps = scatter(rand, 9, { x0: W * 0.6, y0: H * 0.18, x1: W * 0.9, y1: H * 0.8 }, Math.max(7, H * 0.17));
    nodes = [bug, ...past, ...comps];
    firstComp = 1 + past.length;

    const seen = new Set<string>();
    edges = [];
    const add = (a: number, b: number) => {
      const k = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (a === b || seen.has(k)) return;
      seen.add(k);
      edges.push([a, b]);
    };
    for (let i = 1; i < firstComp; i++) add(0, i);
    for (let i = 1; i < firstComp; i++) {
      nearest(i, firstComp, nodes.length)
        .slice(0, 2)
        .forEach((j) => add(i, j));
      nearest(i, 1, firstComp)
        .slice(0, 1)
        .forEach((j) => add(i, j));
    }
    for (let i = firstComp; i < nodes.length; i++) {
      nearest(i, firstComp, nodes.length)
        .slice(0, 2)
        .forEach((j) => add(i, j));
    }
    links = nodes.map(() => []);
    for (const [a, b] of edges) {
      links[a].push(b);
      links[b].push(a);
    }
  };

  const pickRoute = () => {
    const past = 1 + Math.floor(rand() * (firstComp - 1));
    const comps = links[past].filter((j) => j >= firstComp);
    const first = comps.length ? comps[Math.floor(rand() * comps.length)] : firstComp;
    const next = links[first].filter((j) => j >= firstComp);
    const last = rand() < 0.6 && next.length ? next[Math.floor(rand() * next.length)] : first;
    return last === first ? [0, past, first] : [0, past, first, last];
  };

  return ({ g, t, pointer }) => {
    const W = g.cols;
    const H = g.rows;
    const k = `${W}x${H}`;
    if (k !== key) {
      key = k;
      layout(W, H);
      cycle = -1;
    }

    dotGrid(g);
    g.glow(W * 0.76, H * 0.5, Math.min(W, H) * 0.62, 0.5, [C.T1]);

    const period = 3.4;
    const c = Math.floor(t / period);
    const phase = (t - c * period) / period;
    if (c !== cycle) {
      cycle = c;
      route = pickRoute();
      routed++;
    }

    let hover = -1;
    if (pointer) {
      let best = 8;
      nodes.forEach((n, i) => {
        const d = dist(n, pointer);
        if (d < best) {
          best = d;
          hover = i;
        }
      });
    }

    for (const [a, b] of edges) {
      const hot = hover >= 0 && (a === hover || b === hover);
      g.line(nodes[a].x, nodes[a].y, nodes[b].x, nodes[b].y, hot ? C.T3 : C.T1);
    }

    const segs = route.length - 1;
    const travel = ease(phase / 0.55) * segs;
    for (let s = 0; s < segs; s++) {
      const f = clamp01(travel - s);
      if (f <= 0) break;
      const a = nodes[route[s]];
      const b = nodes[route[s + 1]];
      const e = g.lerpPoint(a.x, a.y, b.x, b.y, f);
      g.line(a.x, a.y, e.x, e.y, C.T3);
    }

    const target = route[route.length - 1];
    const arrived = phase >= 0.55;
    const reached = (i: number) => route.includes(i) && travel >= route.indexOf(i);

    for (let i = 1; i < firstComp; i++) {
      const n = nodes[i];
      g.rect(n.x - 1, n.y - 1, 2, 2, i === hover || reached(i) ? C.T4 : C.T2);
    }
    for (let i = firstComp; i < nodes.length; i++) {
      const n = nodes[i];
      const color = i === target && arrived ? C.T4 : i === hover || reached(i) ? C.T3 : C.N2;
      g.rect(n.x - 1, n.y - 1, 3, 3, color);
    }

    if (phase < 0.55) {
      const s = Math.min(segs - 1, Math.floor(travel));
      const a = nodes[route[s]];
      const b = nodes[route[s + 1]];
      const p = g.lerpPoint(a.x, a.y, b.x, b.y, clamp01(travel - s));
      g.rect(p.x - 1, p.y - 1, 3, 3, C.INK);
    } else {
      const q = (phase - 0.55) / 0.45;
      const n = nodes[target];
      g.ring(n.x, n.y, Math.round(3 + q * 6), q < 0.5 ? C.T3 : C.T2);
      g.frame(n.x - 3, n.y - 3, 7, 7, C.T4);
    }

    const bug = nodes[0];
    g.rect(bug.x - 2, bug.y - 2, 5, 5, C.W2);
    g.rect(bug.x - 1, bug.y - 1, 3, 3, phase < 0.12 ? C.W3 : C.W1);
    g.text(bug.x - 5, bug.y + 5, "BUG", C.W2);

    g.text(2, 2, "GRAPH RAG", C.N2);
    g.text(2, H - 7, `ROUTED ${routed}`, C.N2);
    if (arrived) {
      const name = `SUBCOMP ${pad2(target - firstComp + 1)}`;
      g.text(W - g.textWidth(name) - 2, H - 7, name, C.T4);
    }

    if (hover >= 0) {
      const n = nodes[hover];
      const text = hover === 0 ? "NEW BUG" : hover < firstComp ? "PAST BUG" : `SUBCOMP ${pad2(hover - firstComp + 1)}`;
      tag(g, n.x + 4, n.y - 11, text);
    }
  };
}
