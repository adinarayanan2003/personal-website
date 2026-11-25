import { C, clamp01, dotGrid, ease, rng, type Gfx } from "@/lib/scenes/engine";

import type { Game, GameFrame } from "./types";

/**
 * Resolve: walk a DNS lookup by hand. Click the root, then the TLD, then the
 * authoritative server for the domain on screen. A wrong click times you out for a
 * moment. Domains you already resolved can come back cached: grab the CACHE chip quick.
 */

type Zone = { ns: string; tld: string; suffix: string; hosts: string[] };

const ZONES: Zone[] = [
  { ns: "OWLY", tld: "STUDIO", suffix: "OWLY.STUDIO", hosts: ["WWW", "API", "", "CDN"] },
  { ns: "GITHUB", tld: "COM", suffix: "GITHUB.COM", hosts: ["API", "GIST", "", "WWW"] },
  { ns: "X", tld: "COM", suffix: "X.COM", hosts: ["", "API", "WWW"] },
  { ns: "NITC", tld: "IN", suffix: "NITC.AC.IN", hosts: ["", "WWW", "MAIL"] },
  { ns: "SOCKET", tld: "IO", suffix: "SOCKET.IO", hosts: ["", "CDN"] },
  { ns: "KERNEL", tld: "ORG", suffix: "KERNEL.ORG", hosts: ["", "GIT", "WWW"] },
];
const DECOYS = ["NET", "IO", "ORG", "DEV", "APP", "IN"];

const PENALTY = 0.7;
const CACHE_WINDOW = 1.8;
const LEG = 0.11;

type Box = { x: number; y: number; w: number; h: number };
type NodeDef = { label: string; key: number; tld?: string };
type Domain = { name: string; zone: Zone };
/** Packet route through node ids. -1 is the resolver (YOU), -2 the cache chip. */
type Packet = { route: number[]; start: number; color: number };

const YOU = -1;
const CACHE = -2;

function shuffle<T>(rand: () => number, a: T[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fakeIp(name: string) {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) h = Math.imul(h ^ name.charCodeAt(i), 16777619);
  const o = (n: number) => ((h >>> n) & 0xff) % 223 + 20;
  return `${o(0)}.${o(8)}.${o(16)}.${(h >>> 24) & 0xff}`;
}

const inside = (b: Box, x: number, y: number) => x >= b.x - 1 && x < b.x + b.w + 1 && y >= b.y - 1 && y < b.y + b.h + 1;

/** Point on the border of `b` in the direction of (tx, ty). */
function edgePoint(b: Box, tx: number, ty: number) {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const dx = tx - cx;
  const dy = ty - cy;
  const hw = b.w / 2 + 1;
  const hh = b.h / 2 + 1;
  const s = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
  return { x: cx + dx * Math.min(1, s), y: cy + dy * Math.min(1, s) };
}

function link(a: Box, b: Box) {
  const ca = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  const cb = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  return [edgePoint(a, cb.x, cb.y), edgePoint(b, ca.x, ca.y)] as const;
}

export function createDns(seed: number): Game {
  const rand = rng(seed);

  // Board: four zones, the TLDs they need plus decoys, numbered 1 (root), 2-5, 6-9.
  const zones = shuffle(rand, ZONES.slice()).slice(0, 4);
  const tlds = Array.from(new Set(zones.map((z) => z.tld)));
  for (const d of shuffle(rand, DECOYS.slice())) if (tlds.length < 4 && !tlds.includes(d)) tlds.push(d);
  shuffle(rand, tlds);
  // Authoritative servers sit next to their TLD, so the links don't tangle.
  zones.sort((a, b) => tlds.indexOf(a.tld) - tlds.indexOf(b.tld));

  const nodes: NodeDef[] = [
    { label: "ROOT", key: 1 },
    ...tlds.map((label, i) => ({ label, key: 2 + i })),
    ...zones.map((z, i) => ({ label: z.ns, key: 6 + i, tld: z.tld })),
  ];
  const domains: Domain[] = zones.flatMap((zone) =>
    zone.hosts.map((h) => ({ name: h ? `${h}.${zone.suffix}` : zone.suffix, zone })),
  );

  let t = 0;
  let score = 0;
  let domain = domains[Math.floor(rand() * domains.length)];
  let domainAt = 0;
  let path: number[] = [];
  let penaltyUntil = -1;
  let wrong = { node: -9, at: -9 };
  const okAt = new Array(nodes.length).fill(-9);
  const cache = new Map<string, string>();
  let cacheUntil = -1;
  let cacheHitAt = -9;
  let packets: Packet[] = [];
  let answer = { text: "", at: -9, color: C.T4 as number };
  let boxes: Box[] = [];
  let youBox: Box = { x: 0, y: 0, w: 0, h: 0 };
  let cacheBox: Box = { x: 0, y: 0, w: 0, h: 0 };

  const chain = () => [0, 1 + tlds.indexOf(domain.zone.tld), 5 + zones.indexOf(domain.zone)];
  const boxOf = (id: number) => (id === YOU ? youBox : id === CACHE ? cacheBox : boxes[id]);

  const nextDomain = () => {
    const prev = domain.name;
    const cached = [...cache.keys()].filter((d) => d !== prev);
    let pick: Domain;
    if (cached.length && rand() < 0.3) {
      const name = cached[Math.floor(rand() * cached.length)];
      pick = domains.find((d) => d.name === name)!;
    } else {
      const pool = domains.filter((d) => d.name !== prev);
      pick = pool[Math.floor(rand() * pool.length)];
    }
    domain = pick;
    domainAt = t;
    path = [];
    cacheUntil = cache.has(domain.name) ? t + CACHE_WINDOW : -1;
  };

  const select = (id: number) => {
    if (t < penaltyUntil || id < 0 || id >= nodes.length || path.includes(id)) return;
    const want = chain()[path.length];
    if (id !== want) {
      penaltyUntil = t + PENALTY;
      wrong = { node: id, at: t };
      return;
    }
    const from = path.length ? path[path.length - 1] : YOU;
    path.push(id);
    okAt[id] = t;
    packets.push({ route: [from, id], start: t, color: C.INK });
    if (path.length === 3) {
      score += 1;
      const ip = fakeIp(domain.name);
      cache.set(domain.name, ip);
      packets.push({ route: [id, path[1], 0, YOU], start: t + LEG, color: C.T4 });
      answer = { text: `+1 A ${ip}`, at: t, color: C.T4 };
      nextDomain();
    }
  };

  const useCache = () => {
    if (t < penaltyUntil || cacheUntil < t) return;
    score += 2;
    cacheHitAt = t;
    packets.push({ route: [CACHE, YOU], start: t, color: C.T4 });
    answer = { text: `+2 CACHED ${cache.get(domain.name) ?? ""}`, at: t, color: C.T4 };
    nextDomain();
  };

  const layout = (g: Gfx) => {
    const W = g.cols;
    const H = g.rows;
    const bh = H < 80 ? 7 : 9;
    const top = 14;
    const bottom = H - 11;
    const bw = (s: string) => g.textWidth(s) + 8;
    const rootW = bw("ROOT");
    const tW = Math.max(...tlds.map(bw));
    const aW = Math.max(...zones.map((z) => bw(z.ns)));
    const free = W - 4 - rootW - tW - aW;
    const youW = 9;
    const showYou = free - youW >= 3 * 9;
    const gap = Math.min(26, Math.floor(showYou ? (free - youW) / 3 : free / 2));
    const total = (showYou ? youW + gap : 0) + rootW + gap + tW + gap + aW;
    let x = Math.max(2, Math.floor((W - total) / 2));
    const mid = Math.round((top + bottom - bh) / 2);
    if (showYou) {
      youBox = { x, y: mid, w: youW, h: bh };
      x += youW + gap;
    } else {
      youBox = { x: 1, y: 1, w: g.textWidth(domain.name) + 4, h: 9 };
    }
    const rootX = x;
    const tX = rootX + rootW + gap;
    const aX = tX + tW + gap;
    const sp = (bottom - top - bh) / 3;
    boxes = nodes.map((n, i) => {
      if (i === 0) return { x: rootX, y: mid, w: rootW, h: bh };
      const col = i < 5 ? tX : aX;
      const row = i < 5 ? i - 1 : i - 5;
      return { x: col, y: Math.round(top + row * sp), w: bw(n.label), h: bh };
    });
    cacheBox = { x: 2, y: H - 9, w: bw("CACHE 00"), h: 7 };
    return { showYou, W, H };
  };

  const drawBox = (g: Gfx, b: Box, key: string, label: string, chip: number, digit: number, fg: number, fill: number, frame: number) => {
    g.rect(b.x, b.y, b.w, b.h, fill);
    g.rect(b.x, b.y, 5, b.h, chip);
    const ty = b.y + Math.floor((b.h - 5) / 2);
    g.text(b.x + 1, ty, key, digit);
    g.text(b.x + 7, ty, label, fg);
    if (frame) g.frame(b.x - 1, b.y - 1, b.w + 2, b.h + 2, frame);
  };

  return {
    score: () => score,
    over: () => false,
    step({ g, dt, pointer, clicks, keys }: GameFrame) {
      t += dt;
      const { showYou, W, H } = layout(g);

      // Cache entries live only as long as their chip: miss it and the record expires.
      if (cacheUntil >= 0 && t > cacheUntil) {
        cache.delete(domain.name);
        cacheUntil = -1;
      }

      for (const c of clicks) {
        if (cacheUntil >= t && inside(cacheBox, c.x, c.y)) {
          useCache();
          continue;
        }
        const hit = boxes.findIndex((b) => inside(b, c.x, c.y));
        if (hit >= 0) select(hit);
      }
      for (const k of keys) {
        if (k >= "1" && k <= "9") select(Number(k) - 1);
        else if (k === "0" || k === "c" || k === "C" || k === " " || k === "Enter") useCache();
      }
      layout(g);
      packets = packets.filter((p) => t - p.start < (p.route.length - 1) * LEG + 0.05);

      dotGrid(g);
      const penalized = t < penaltyUntil;

      // Links: resolver to root, root to every TLD, each TLD to its servers.
      const lit = new Set<string>();
      let prev = YOU;
      for (const id of path) {
        lit.add(`${prev}>${id}`);
        prev = id;
      }
      const wire = (a: number, b: number) => {
        const [p, q] = link(boxOf(a), boxOf(b));
        g.line(p.x, p.y, q.x, q.y, lit.has(`${a}>${b}`) ? C.T2 : C.T1);
      };
      if (showYou) wire(YOU, 0);
      for (let i = 1; i < 5; i++) wire(0, i);
      for (let i = 5; i < 9; i++) wire(1 + tlds.indexOf(nodes[i].tld!), i);
      const cacheLive = cacheUntil >= t;
      if (cacheLive) {
        const [p, q] = link(cacheBox, youBox);
        g.line(p.x, p.y, q.x, q.y, C.T2, 2, Math.floor(t * 14));
      }

      // Packets in flight.
      for (const p of packets) {
        const age = t - p.start;
        if (age < 0) continue;
        const leg = Math.min(p.route.length - 2, Math.floor(age / LEG));
        const f = ease(clamp01((age - leg * LEG) / LEG));
        const [a, b] = link(boxOf(p.route[leg]), boxOf(p.route[leg + 1]));
        g.line(a.x, a.y, b.x, b.y, C.T2);
        const at = g.lerpPoint(a.x, a.y, b.x, b.y, f);
        g.rect(at.x - 1, at.y - 1, 2, 2, p.color);
      }

      // Hover.
      let hover = -1;
      if (pointer) hover = boxes.findIndex((b) => inside(b, pointer.x, pointer.y));

      // Servers.
      nodes.forEach((n, i) => {
        const b = boxes[i];
        const done = path.includes(i);
        const flashBad = wrong.node === i && t - wrong.at < 0.5;
        const flashOk = t - okAt[i] < 0.25;
        const blink = flashBad && Math.floor((t - wrong.at) * 12) % 2 === 0;
        if (flashBad) drawBox(g, b, String(n.key), n.label, C.W2, C.N1, C.W3, C.W1, blink ? C.W3 : C.W2);
        else if (done) drawBox(g, b, String(n.key), n.label, C.T3, C.N1, C.T4, C.N1, flashOk ? C.T4 : C.T2);
        else if (flashOk) drawBox(g, b, String(n.key), n.label, C.T3, C.N1, C.INK, C.N1, C.T4);
        else
          drawBox(
            g,
            b,
            String(n.key),
            n.label,
            penalized ? C.N1 : C.N2,
            penalized ? C.N2 : C.INK,
            hover === i && !penalized ? C.INK : penalized ? C.N2 : C.N3,
            C.N1,
            hover === i && !penalized ? C.N3 : 0,
          );
      });

      // Resolver.
      if (showYou) {
        const b = youBox;
        const glow = t - answer.at < 0.5 && t - answer.at > LEG * 2;
        g.rect(b.x, b.y, b.w, b.h, C.N1);
        g.frame(b.x, b.y, b.w, b.h, glow ? C.T4 : C.T3);
        g.rect(b.x + 3, b.y + Math.floor(b.h / 2) - 1, 3, 2, glow ? C.T4 : C.T2);
        if (H >= 80) g.text(b.x + Math.round((b.w - g.textWidth("YOU")) / 2), b.y - 8, "YOU", C.N3);
      }

      // Query plate, typed in when a new domain arrives.
      const q = domain.name;
      const shown = q.slice(0, Math.max(1, Math.round(clamp01((t - domainAt) / 0.18) * q.length)));
      const plateW = g.textWidth(q) + 4;
      g.rect(1, 1, plateW, 9, C.N1);
      if (penalized) {
        const left = clamp01((penaltyUntil - t) / PENALTY);
        g.rect(1, 9, Math.round(plateW * left), 1, C.W2);
      }
      // The part already resolved turns teal: TLD after the root, the zone after the TLD.
      const resolved = path.length >= 2 ? domain.zone.suffix : path.length >= 1 ? domain.zone.tld : "";
      const head = shown.slice(0, q.length - resolved.length);
      g.text(3, 3, head, C.INK);
      if (shown.length > head.length) g.text(3 + head.length * 4, 3, shown.slice(head.length), C.T3);

      // Score, top right.
      const s = String(score);
      const sw = g.textWidth(s);
      g.text(W - sw - 2, 3, s, C.INK);
      if (W - sw - 2 - g.textWidth("SCORE ") > plateW + 4) g.text(W - sw - 2 - g.textWidth("SCORE "), 3, "SCORE", C.N3);

      // Cache chip, bottom left.
      const cacheLeft = cacheLive ? (cacheUntil - t) / CACHE_WINDOW : 0;
      if (cacheLive) {
        const blink = Math.floor(t * 6) % 2 === 0;
        drawBox(g, cacheBox, "0", "CACHE", C.T3, C.N1, C.T4, C.N1, blink ? C.T4 : C.T2);
        g.rect(cacheBox.x, cacheBox.y + cacheBox.h + 1, Math.round(cacheBox.w * cacheLeft), 1, C.T3);
      } else if (t - cacheHitAt < 0.4) {
        drawBox(g, cacheBox, "0", "HIT +2", C.T4, C.N1, C.T4, C.N1, C.T4);
      } else {
        drawBox(g, cacheBox, "0", `CACHE ${cache.size}`, C.N1, C.N2, C.N2, C.N1, 0);
      }

      // Status, bottom right.
      let status = "";
      let color: number = C.N2;
      if (penalized) {
        status = "TIMEOUT";
        color = C.W3;
      } else if (t - answer.at < 1.1) {
        status = answer.text;
        color = answer.color;
      } else if (path.length < 3) {
        status = ["ROOT?", "TLD?", "NS?"][path.length];
        color = C.N3;
      }
      if (status) {
        const room = W - (cacheBox.x + cacheBox.w + 4) - 2;
        while (status.length && g.textWidth(status) > room) status = status.slice(0, -1);
        g.text(W - g.textWidth(status) - 2, H - 8, status, color);
      }
    },
  };
}
