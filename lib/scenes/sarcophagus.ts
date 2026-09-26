import { C, clamp01, dotGrid, type Scene } from "./engine";

const CYCLE = 10;

/**
 * Sarcophagus, a dead man's switch: every heartbeat resets the timer. When the beats
 * stop, the timer runs out and the vault releases its contents. Move the pointer to
 * keep it alive.
 */
export function sarcophagus(): Scene {
  let trace: number[] = [];
  let lastBeat = -9;
  let deadline = 4;
  let released = -1;
  let last: { x: number; y: number } | null = null;
  let resetAt = 0;

  return ({ g, t, pointer }) => {
    const W = g.cols;
    const H = g.rows;
    dotGrid(g);

    const lineY = Math.round(H * 0.3);
    if (trace.length !== W) trace = new Array(W).fill(0);

    // A beat comes from pointer movement, or on a timer when nobody is around.
    const moved = pointer && last && Math.hypot(pointer.x - last.x, pointer.y - last.y) > 0.6;
    last = pointer ? { x: pointer.x, y: pointer.y } : null;
    const lc = (t - resetAt) % CYCLE;
    const auto = !pointer && lc < 5.2 && t - lastBeat > 1.1;
    if (released < 0 && (auto || (moved && t - lastBeat > 0.35))) {
      lastBeat = t;
      deadline = t + 3;
    }

    // Timer and release.
    const remaining = clamp01((deadline - t) / 3);
    if (released < 0 && remaining <= 0) released = t;
    if (released >= 0 && t - released > 2.6) {
      released = -1;
      resetAt = t;
      lastBeat = t;
      deadline = t + 3;
    }

    // Heart trace scrolls left; spike right after a beat.
    trace.shift();
    const since = t - lastBeat;
    const spike = released >= 0 ? 0 : since < 0.07 ? -6 : since < 0.14 ? 5 : since < 0.2 ? -2 : 0;
    trace.push(spike);
    for (let x = 1; x < W; x++) g.line(x - 1, lineY + trace[x - 1], x, lineY + trace[x], released >= 0 ? C.N2 : C.T3);
    g.text(3, 3, released >= 0 ? "NO PULSE" : "PULSE", released >= 0 ? C.W2 : C.N2);

    // Vault with a shackle that lifts on release.
    const cx = Math.round(W / 2);
    const bodyW = 13;
    const bodyH = 9;
    const by = Math.round(H * 0.58);
    const open = released >= 0 ? clamp01((t - released) / 0.4) : 0;
    const lift = Math.round(open * 3);
    const shackle = released >= 0 ? C.W3 : C.N3;
    for (let x = -3; x <= 3; x++) g.px(cx + x, by - 6 - lift, shackle);
    g.rect(cx - 4, by - 5 - lift, 1, 5 + (lift ? 0 : 1), shackle);
    g.rect(cx + 4, by - 5 - lift, 1, 5 - lift + 1, shackle);
    g.rect(cx - (bodyW >> 1), by, bodyW, bodyH, released >= 0 ? C.W2 : C.T2);
    g.rect(cx, by + 3, 1, 3, C.N1);
    g.px(cx, by + 2, C.N1);

    // Countdown bar.
    const barW = Math.round(W * 0.5);
    const barX = cx - (barW >> 1);
    const barY = by + bodyH + 4;
    g.rect(barX, barY, barW, 2, C.N1);
    g.rect(barX, barY, Math.round(barW * remaining), 2, remaining < 0.3 ? C.W2 : C.T3);

    // Released: data flies out of the vault.
    if (released >= 0) {
      const age = t - released;
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const r = age * 16;
        g.rect(cx + Math.cos(a) * r, by + 3 + Math.sin(a) * r * 0.7, 2, 2, i % 2 ? C.T4 : C.W3);
      }
      g.text(cx - (g.textWidth("RELEASED") >> 1), H - 7, "RELEASED", C.W3);
    } else if (pointer) {
      g.text(cx - (g.textWidth("KEEP MOVING") >> 1), H - 7, "KEEP MOVING", C.N3);
    }
  };
}
