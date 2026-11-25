import { C, clamp01, dotGrid, rng, type Gfx } from "@/lib/scenes/engine";

import type { Game, GameFrame } from "./types";

/**
 * Heartbeat: a dead man's switch. Press while the sweeping marker is inside the zone to
 * send a heartbeat. Every beat narrows the zone and speeds the sweep up. A miss (or no
 * beat for a few seconds) cracks the vault; three cracks and it opens.
 */

const PULSE = 3.6;
const LIVES = 3;
const SPILL = 1.5;

type Particle = { x: number; y: number; vx: number; vy: number; c: number; w: number };

/** Jagged cracks across the vault body, in body units (15 x 11). */
const CRACKS: [number, number][][] = [
  [
    [0, 3],
    [3, 4],
    [5, 3],
    [7, 5],
  ],
  [
    [15, 7],
    [12, 6],
    [11, 8],
    [8, 7],
  ],
  [
    [6, 0],
    [7, 2],
    [6, 4],
    [8, 6],
    [7, 9],
    [9, 11],
  ],
];

export function createSarcophagus(seed: number): Game {
  const rand = rng(seed);
  let t = 0;
  let score = 0;
  let cracks = 0;
  let openAt = -1;
  let deadline = PULSE;
  let phase = 0;
  let speed = 0.7;
  let zoneW = 0.24;
  let zoneC = 0.3 + rand() * 0.4;
  let lastPress = -9;
  let hitAt = -9;
  let missAt = -9;
  let missWhy = "";
  const beats: number[] = [];
  const misses: number[] = [];
  let particles: Particle[] = [];

  const marker = () => {
    const p = phase % 2;
    return p < 1 ? p : 2 - p;
  };

  const crack = (why: string, at: number) => {
    cracks++;
    missAt = at;
    missWhy = why;
    misses.push(at);
    deadline = at + PULSE;
    if (cracks >= LIVES) openAt = at;
  };

  const spill = (cx: number, top: number, s: number) => {
    const colors = [C.T4, C.W3, C.INK, C.T3, C.W2];
    particles = Array.from({ length: 22 }, (_, i) => ({
      x: cx + (rand() - 0.5) * 8 * s,
      y: top + 2,
      vx: (rand() - 0.5) * 70,
      vy: -30 - rand() * 50,
      c: colors[i % colors.length],
      w: i % 4 === 0 ? 3 : 2,
    }));
  };

  return {
    score: () => score,
    over: () => openAt >= 0 && t - openAt > SPILL,
    step({ g, dt, clicks, keys }: GameFrame) {
      t += dt;
      const W = g.cols;
      const H = g.rows;
      const s = H >= 85 && W >= 120 ? 2 : 1;
      const alive = openAt < 0;

      // Layout.
      const ecgY = s === 2 ? 20 : 14;
      const bodyW = 15 * s;
      const bodyH = 11 * s;
      const by = ecgY + 9 + 6 * s;
      const shake = t - missAt < 0.25 ? (Math.floor(t * 40) % 2 ? 1 : -1) : 0;
      const bx = Math.round(W / 2 - bodyW / 2) + shake;
      const barW = Math.round(W * 0.76);
      const barX = Math.round((W - barW) / 2);
      const barH = s === 2 ? 8 : 6;
      const barY = H - (s === 2 ? 21 : 15);

      const toX = (v: number) => barX + 1 + Math.round(v * (barW - 3));

      // Input: Space, Enter or any click/tap.
      // Judge the press against the frame the player saw, then move the marker on.
      const seen = toX(marker());
      const pressed = clicks.length > 0 || keys.some((k) => k === " " || k === "Enter" || k === "Spacebar");
      if (alive && pressed && t - lastPress > 0.12) {
        lastPress = t;
        if (seen >= toX(zoneC - zoneW / 2) && seen <= toX(zoneC + zoneW / 2)) {
          score++;
          beats.push(t);
          hitAt = t;
          deadline = t + PULSE;
          zoneW = Math.max(0.07, zoneW * 0.92);
          speed = Math.min(1.6, speed * 1.06);
          // Move the zone, and keep it away from where the marker is now.
          let c = zoneC;
          for (let i = 0; i < 6; i++) {
            c = zoneW / 2 + 0.03 + rand() * (1 - zoneW - 0.06);
            if (Math.abs(c - marker()) > 0.2) break;
          }
          zoneC = c;
        } else crack("MISS", t);
      }
      if (alive && t > deadline) crack("NO PULSE", deadline);
      if (alive) phase += dt * speed;
      const mx = toX(marker());
      const z0 = toX(zoneC - zoneW / 2);
      const z1 = toX(zoneC + zoneW / 2);
      if (openAt >= 0 && !particles.length) spill(bx + bodyW / 2, by, s);

      dotGrid(g);

      // HUD: beats and remaining seals.
      g.text(2, 2, "BEATS", C.N3);
      g.text(2 + g.textWidth("BEATS "), 2, String(score), C.INK);
      drawPips(g, W, LIVES, cracks, t - missAt < 0.5);

      // Heart trace, scrolling left at 30 cells a second.
      let prevY = ecgY;
      for (let x = 0; x < W; x++) {
        const at = t - (W - 1 - x) / 30;
        let y = ecgY;
        let c: number = C.T3;
        if (openAt >= 0 && at >= openAt) c = C.N2;
        else {
          for (let i = beats.length - 1; i >= 0; i--) {
            if (beats[i] <= at) {
              const since = at - beats[i];
              y += since < 0.07 ? -6 : since < 0.14 ? 5 : since < 0.2 ? -2 : 0;
              break;
            }
          }
          for (let i = misses.length - 1; i >= 0; i--) {
            if (misses[i] <= at && at - misses[i] < 0.3) {
              c = C.W2;
              y = ecgY + (x % 2 ? 1 : -1);
              break;
            }
          }
        }
        if (x > 0) g.line(x - 1, prevY, x, y, c);
        prevY = y;
      }

      // Vault: shackle, body, dial, cracks.
      const open = openAt >= 0 ? clamp01((t - openAt) / 0.35) : 0;
      const lift = Math.round(open * 4 * s);
      const shackle = openAt >= 0 ? C.W3 : C.N3;
      const shW = 9 * s;
      const shX = bx + Math.round((bodyW - shW) / 2);
      const shTop = by - 6 * s - lift;
      g.rect(shX, shTop, shW, s, shackle);
      // Open: the left leg stays in the body, the right one pops out.
      g.rect(shX, shTop, s, 6 * s + lift, shackle);
      g.rect(shX + shW - s, shTop, s, lift ? 5 * s : 6 * s, shackle);
      const bodyC = openAt >= 0 ? C.W2 : t - missAt < 0.2 ? C.W2 : t - hitAt < 0.15 ? C.T3 : C.T2;
      g.rect(bx, by, bodyW, bodyH, bodyC);
      const dcx = bx + Math.floor(bodyW / 2);
      const dcy = by + Math.floor(bodyH / 2);
      if (s === 2) {
        g.ring(dcx, dcy, 4, C.N1);
        g.px(dcx, dcy, C.N1);
        const a = phase * 3;
        g.line(dcx, dcy, dcx + Math.round(Math.cos(a) * 2), dcy + Math.round(Math.sin(a) * 2), C.N1);
      } else {
        g.rect(dcx - 1, dcy - 1, 3, 3, C.N1);
        g.px(dcx, dcy, bodyC);
      }
      for (let i = 0; i < Math.min(cracks, CRACKS.length); i++) {
        const pts = CRACKS[i];
        const fresh = t - misses[i] < 0.4;
        for (let j = 1; j < pts.length; j++) {
          const [x0, y0] = pts[j - 1];
          const [x1, y1] = pts[j];
          const sx = (v: number) => bx + Math.min(bodyW - 1, Math.round((v * bodyW) / 15));
          const sy = (v: number) => by + Math.min(bodyH - 1, Math.round((v * bodyH) / 11));
          g.line(sx(x0), sy(y0), sx(x1), sy(y1), fresh ? C.W3 : C.N1);
          if (s === 2) g.line(sx(x0) + 1, sy(y0), sx(x1) + 1, sy(y1), fresh ? C.W3 : C.N1);
        }
      }

      // Contents spilling out once it's open.
      if (particles.length) {
        const floor = by + bodyH + 2 * s;
        for (const p of particles) {
          p.vy += 140 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.y > floor) {
            p.y = floor;
            p.vy *= -0.35;
            p.vx *= 0.7;
          }
          g.rect(p.x, p.y, p.w * s, 2 * (s === 2 ? 1.5 : 1), p.c);
        }
      }

      // Pulse countdown under the vault.
      const remain = openAt >= 0 ? 0 : clamp01((deadline - t) / PULSE);
      const cdW = Math.round(W * 0.36);
      const cdX = Math.round((W - cdW) / 2);
      const cdY = by + bodyH + (s === 2 ? 5 : 3);
      g.rect(cdX, cdY, cdW, 1, C.N1);
      g.rect(cdX, cdY, Math.round(cdW * remain), 1, remain < 0.3 ? C.W2 : C.T3);

      // Timing bar.
      const missFlash = t - missAt < 0.3;
      g.rect(barX, barY, barW, barH, C.N1);
      g.rect(z0, barY + 1, z1 - z0 + 1, barH - 2, t - hitAt < 0.15 ? C.T4 : C.T2);
      g.rect(z0, barY + 1, 1, barH - 2, C.T3);
      g.rect(z1, barY + 1, 1, barH - 2, C.T3);
      g.frame(barX - 1, barY - 1, barW + 2, barH + 2, missFlash ? C.W2 : C.N2);
      if (alive || missFlash) {
        const mc = missFlash ? C.W3 : C.INK;
        g.rect(mx, barY - 2, 1, barH + 4, mc);
        g.px(mx - 1, barY - 3, mc);
        g.px(mx, barY - 3, mc);
        g.px(mx + 1, barY - 3, mc);
      }
      if (t - hitAt < 0.45) {
        const rise = s === 2 ? Math.round((t - hitAt) * 14) : 0;
        g.text(Math.round((z0 + z1) / 2) - 3, barY - 9 - rise, "+1", C.T4);
      }

      // Bottom line.
      let msg = W >= 140 ? "SPACE OR TAP IN THE ZONE" : "SPACE / TAP";
      let mc: number = C.N2;
      if (openAt >= 0) {
        msg = "RELEASED";
        mc = C.W3;
      } else if (t - missAt < 0.8) {
        msg = `${missWhy} - ${LIVES - cracks} LEFT`;
        mc = C.W3;
      }
      g.text(Math.round((W - g.textWidth(msg)) / 2), H - 7, msg, mc);
    },
  };
}

/** Lives as small squares, top right. Lost ones turn warm. */
export function drawPips(g: Gfx, W: number, total: number, lost: number, flash: boolean) {
  for (let i = 0; i < total; i++) {
    const x = W - 2 - (total - i) * 7 + 1;
    const gone = i >= total - lost;
    if (gone) g.rect(x, 2, 5, 5, flash && i === total - lost ? C.W3 : C.W2);
    else {
      g.rect(x, 2, 5, 5, C.T2);
      g.rect(x + 1, 3, 3, 3, C.T3);
    }
  }
}
