import { C, dotGrid, type Gfx, type Scene } from "./engine";

const RUN_S = 8;
const LIFT_S = 6;

type P = { x: number; y: number };

/** A limb drawn two cells thick so the figure reads at pixel scale. */
function limb(g: Gfx, a: P, b: P, c: number) {
  g.line(a.x, a.y, b.x, b.y, c);
  g.line(a.x + 1, a.y, b.x + 1, b.y, c);
}

const polar = (o: P, angle: number, len: number): P => ({ x: o.x + Math.sin(angle) * len, y: o.y + Math.cos(angle) * len });

/**
 * Fitness: a figure runs laps on a track, then switches to barbell squats.
 * Hovering makes it sprint (or rep faster).
 */
export function fitness(): Scene {
  let phase = 0;
  let scroll = 0;
  let km = 3.2;

  return ({ g, t, dt, pointer }) => {
    const W = g.cols;
    const H = g.rows;
    const s = Math.max(0.6, H / 72);
    const cycle = t % (RUN_S + LIFT_S);
    const running = cycle < RUN_S;
    const age = running ? cycle : cycle - RUN_S;
    const fast = !!pointer;
    const step = dt;

    dotGrid(g);
    const ground = H - Math.round(12 * s);

    if (running) {
      const speed = fast ? 1.8 : 1;
      phase += step * 9.5 * speed;
      scroll += step * 20 * speed;
      km += step * 0.004 * speed;

      // Skyline drifting behind, slower than the track.
      for (let x = 0; x < W; x++) {
        const sx = Math.floor((x + scroll * 0.25) / 7);
        const h = 6 + ((sx * 37) % 9) * 1.4 * s;
        g.rect(x, ground - Math.round(h), 1, Math.round(h), sx % 3 === 0 ? C.N1 : C.GRID);
      }
      g.rect(0, ground, W, H - ground, C.N1);
      g.rect(0, ground, W, 1, C.N2);
      for (let x = 0; x < W; x++) if (Math.floor((x + scroll) / 5) % 2 === 0) g.px(x, ground + Math.round(5 * s), C.N3);

      drawRunner(g, Math.round(W * 0.42), ground, s, phase);

      const pace = fast ? "3:40" : "5:10";
      g.text(2, 2, "RUN", C.N2);
      const dist = `${km.toFixed(2)} KM`;
      g.text(W - g.textWidth(dist) - 2, 2, dist, C.T3);
      g.text(W - g.textWidth(`${pace} /KM`) - 2, 9, `${pace} /KM`, fast ? C.W3 : C.N3);
    } else {
      const period = fast ? 1.3 : 2.2;
      const reps = Math.floor(age / period) + 1;
      const depth = (1 - Math.cos(((age % period) / period) * Math.PI * 2)) / 2;

      g.rect(Math.round(W * 0.2), ground, Math.round(W * 0.6), Math.max(2, Math.round(2 * s)), C.N2);
      g.rect(0, ground + Math.round(2 * s), W, H - ground, C.N1);
      drawSquat(g, Math.round(W * 0.5), ground, s, depth);

      g.text(2, 2, "SQUAT", C.N2);
      const rep = `REP ${reps}`;
      g.text(W - g.textWidth(rep) - 2, 2, rep, C.T3);
    }

    // Quick wipe when the activity switches.
    if (age < 0.3) g.rect(Math.round((age / 0.3) * W), 0, W, H, C.NONE);
  };
}

function drawRunner(g: Gfx, cx: number, ground: number, s: number, phase: number) {
  const thigh = 8 * s;
  const shin = 8 * s;
  const bob = Math.abs(Math.sin(phase)) * 1.5 * s;
  const hip: P = { x: cx, y: ground - thigh - shin + 2 * s - bob };
  const neck: P = { x: cx + 3 * s, y: hip.y - 13 * s };

  const leg = (p: number, c: number) => {
    const t = 0.65 * Math.sin(p);
    const knee = polar(hip, t, thigh);
    const fold = 0.2 + 1.3 * Math.max(0, -Math.cos(p));
    const foot = polar(knee, t - fold, shin);
    foot.y = Math.min(foot.y, ground - 1);
    limb(g, hip, knee, c);
    limb(g, knee, foot, c);
  };
  const arm = (p: number, c: number) => {
    const a = -0.8 * Math.sin(p);
    const elbow = polar(neck, a, 6 * s);
    const hand = polar(elbow, a + 1.6, 5 * s);
    limb(g, neck, elbow, c);
    limb(g, elbow, hand, c);
  };

  // Far limbs first, dimmer, for a bit of depth.
  leg(phase + Math.PI, C.N3);
  arm(phase, C.N3);
  limb(g, hip, neck, C.INK);
  leg(phase, C.INK);
  arm(phase + Math.PI, C.INK);
  g.disc(neck.x + Math.round(1.5 * s), neck.y - Math.round(4 * s), Math.max(2, Math.round(2.6 * s)), C.INK);
  // Headband.
  g.rect(neck.x - Math.round(0.5 * s), neck.y - Math.round(5 * s), Math.round(4 * s), 1, C.T3);
}

function drawSquat(g: Gfx, cx: number, ground: number, s: number, depth: number) {
  const thigh = 8 * s;
  const shin = 8 * s;
  const foot: P = { x: cx, y: ground - 1 };
  // Hip drops and moves back; knees travel forward.
  const hip: P = { x: cx - 4 * s * depth, y: ground - (thigh + shin - 1) + depth * 7 * s };
  const knee: P = { x: cx + 3 * s * depth + 1, y: (hip.y + foot.y) / 2 - (1 - depth) * 0.5 };
  const lean = 0.15 + 0.45 * depth;
  const neck = polar(hip, Math.PI - lean, 13 * s);

  limb(g, foot, knee, C.INK);
  limb(g, knee, hip, C.INK);
  limb(g, hip, neck, C.INK);
  g.disc(neck.x + Math.round(1 * s), neck.y - Math.round(4 * s), Math.max(2, Math.round(2.6 * s)), C.INK);

  // Bar across the shoulders, plates on both ends, hands on the bar.
  const barY = Math.round(neck.y + 1);
  const half = Math.round(16 * s);
  g.rect(Math.round(neck.x - half), barY, half * 2, 1, C.N3);
  for (const side of [-1, 1]) {
    const px = Math.round(neck.x + side * (half - 2 * s));
    const ph = Math.round(10 * s);
    g.rect(px - 1, barY - (ph >> 1), 2, ph, C.W2);
    g.rect(px + side * 2 - 1, barY - (ph >> 2), 2, ph >> 1, C.W1);
  }
  const hand: P = { x: neck.x - 5 * s, y: barY };
  limb(g, neck, { x: neck.x - 3 * s, y: neck.y + 5 * s }, C.N3);
  limb(g, { x: neck.x - 3 * s, y: neck.y + 5 * s }, hand, C.N3);
}
