import { C, clamp01, dotGrid, ease, type Scene } from "./engine";

const LOOP = 7.2;

/**
 * Recursive DNS resolver: the resolver walks root, TLD and authoritative servers in
 * turn. Every third lookup is a cache hit, and big answers retry over TCP.
 */
export function dns(): Scene {
  return ({ g, t, pointer }) => {
    const W = g.cols;
    const H = g.rows;
    const cycle = Math.floor(t / LOOP);
    const lt = t - cycle * LOOP;
    const cached = cycle % 3 === 2;
    const tcp = cycle % 3 === 1;
    dotGrid(g);

    const you = { x: Math.round(W * 0.14), y: Math.round(H * 0.46) };
    const cache = { x: you.x, y: Math.min(H - 10, you.y + Math.round(H * 0.3)) };
    const serverX = Math.round(W * 0.72);
    const servers = [
      { name: "ROOT", y: Math.round(H * 0.2) },
      { name: "COM", y: Math.round(H * 0.46) },
      { name: "NS1", y: Math.round(H * 0.72) },
    ];

    // Wires.
    servers.forEach((s) => g.line(you.x + 5, you.y, serverX - 2, s.y, C.T1));
    g.line(you.x, you.y + 4, cache.x, cache.y - 4, C.T1);
    if (tcp) g.line(you.x + 5, you.y + 3, serverX - 2, servers[2].y + 3, C.T1, 2, 0);

    // Hops for this lookup.
    const hops: { to: { x: number; y: number }; label: string; lane?: number }[] = cached
      ? [{ to: cache, label: "HIT" }]
      : [
          { to: { x: serverX - 2, y: servers[0].y }, label: "" },
          { to: { x: serverX - 2, y: servers[1].y }, label: "" },
          { to: { x: serverX - 2, y: servers[2].y }, label: tcp ? "TC" : "" },
          ...(tcp ? [{ to: { x: serverX - 2, y: servers[2].y + 3 }, label: "TCP", lane: 3 }] : []),
        ];
    const hopTime = cached ? 1.4 : 1.25;
    const hop = Math.floor(lt / hopTime);
    const hp = (lt - hop * hopTime) / hopTime;

    let hoverServer = -1;
    if (pointer) servers.forEach((s, i) => Math.abs(pointer.y - s.y) < 4 && pointer.x > serverX - 6 && (hoverServer = i));

    if (hop < hops.length) {
      const h = hops[hop];
      const from = { x: you.x + 5, y: you.y + (h.lane ?? 0) };
      const out = hp < 0.5;
      const f = ease(out ? hp / 0.5 : (1 - hp) / 0.5);
      const p = g.lerpPoint(from.x, from.y, h.to.x, h.to.y, f);
      g.line(from.x, from.y, h.to.x, h.to.y, C.T2);
      const warn = h.label === "TC" && !out;
      g.rect(p.x - 1, p.y - 1, warn ? 3 : 2, warn ? 3 : 2, warn ? C.W3 : out ? C.INK : C.T4);
    }

    // Servers.
    servers.forEach((s, i) => {
      const busy = !cached && hop === i && hp > 0.35 && hp < 0.65;
      const color = busy || hoverServer === i ? C.T4 : C.N2;
      g.frame(serverX, s.y - 3, 7, 7, color);
      g.rect(serverX + 2, s.y - 1, 3, 3, busy ? C.T3 : C.N1);
      g.text(serverX + 10, s.y - 2, s.name, hoverServer === i ? C.INK : C.N3);
    });

    // Resolver and cache.
    g.rect(you.x - 4, you.y - 3, 9, 7, C.N1);
    g.frame(you.x - 4, you.y - 3, 9, 7, C.T3);
    g.text(you.x - 5, you.y - 11, "YOU", C.N3);
    const hit = cached && hop === 0 && hp > 0.4;
    g.frame(cache.x - 4, cache.y - 3, 9, 7, hit ? C.T4 : C.N2);
    g.text(cache.x + 7, cache.y - 2, hit ? "HIT" : "CACHE", hit ? C.T4 : C.N3);
    if (tcp && hop >= 3) g.text(serverX - 16, servers[2].y + 6, "TCP", C.W2);

    // Answer.
    const answered = lt > hops.length * hopTime;
    const a = clamp01((lt - hops.length * hopTime) / 0.3);
    if (answered && a > 0) g.text(3, 3, "ANSWER 93.184.216.34".slice(0, Math.round(a * 20)), C.T4);
    else g.text(3, 3, "EXAMPLE.COM ?", C.N2);
  };
}
