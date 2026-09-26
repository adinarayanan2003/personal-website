import { C, dotGrid, rng, type Gfx, type Scene } from "./engine";

const BPM = 124;

/**
 * DJing: two decks spin, the mixer's levels bounce on the beat, the waveform scrolls
 * past the playhead. Move across to ride the crossfader; hover a record to scratch it.
 */
export function dj(seed = 21): Scene {
  const rand = rng(seed);
  const wave = Array.from({ length: 512 }, (_, i) => {
    const beat = Math.exp(-((i % 16) / 3));
    return Math.min(1, 0.25 + beat * 0.6 + rand() * 0.25);
  });
  let spinA = 0;
  let spinB = 1.3;
  let fader = 0.5;
  let lastY: number | null = null;

  return ({ g, t, dt, pointer }) => {
    const W = g.cols;
    const H = g.rows;
    dotGrid(g);

    const beatPhase = (t * BPM) / 60;
    const kick = Math.exp(-(beatPhase % 1) * 6);

    // Waveform across the top, played part brighter.
    const wy = 4;
    const wh = Math.max(8, Math.round(H * 0.14));
    const mid = wy + (wh >> 1);
    const center = W >> 1;
    const offset = Math.floor(t * 18);
    for (let x = 1; x < W - 1; x++) {
      const a = wave[(x + offset) % wave.length];
      const h = Math.max(1, Math.round(a * (wh >> 1)));
      g.rect(x, mid - h, 1, h * 2, x < center ? C.T3 : C.N2);
    }
    g.rect(center, wy - 1, 1, wh + 2, C.INK);

    // Crossfader: follows the pointer, otherwise drifts.
    const target = pointer ? Math.min(1, Math.max(0, pointer.x / W)) : 0.5 + Math.sin(t * 0.45) * 0.35;
    fader += (target - fader) * Math.min(1, dt * 8);

    const r = Math.max(8, Math.round(Math.min(W * 0.17, H * 0.27)));
    const deckY = Math.round(H * 0.62);
    const decks = [
      { x: Math.round(W * 0.2), label: C.T2, gain: 1 - fader },
      { x: Math.round(W * 0.8), label: C.W1, gain: fader },
    ];

    // Scratching: moving the pointer over a record spins it with the hand.
    let scratchA = false;
    let scratchB = false;
    if (pointer) {
      const overA = Math.hypot(pointer.x - decks[0].x, pointer.y - deckY) < r;
      const overB = Math.hypot(pointer.x - decks[1].x, pointer.y - deckY) < r;
      const dy = lastY === null ? 0 : pointer.y - lastY;
      if (overA) {
        spinA += dy * 0.25;
        scratchA = true;
      }
      if (overB) {
        spinB += dy * 0.25;
        scratchB = true;
      }
      lastY = pointer.y;
    } else {
      lastY = null;
    }
    if (!scratchA) spinA += dt * 3.46;
    if (!scratchB) spinB += dt * 3.46;

    drawDeck(g, decks[0].x, deckY, r, spinA, decks[0].label, decks[0].gain, kick);
    drawDeck(g, decks[1].x, deckY, r, spinB, decks[1].label, decks[1].gain, kick);

    // Mixer.
    const mx = Math.round(W * 0.38);
    const mw = Math.round(W * 0.24);
    const my = wy + wh + 5;
    const mh = H - my - 3;
    g.rect(mx, my, mw, mh, C.N1);
    g.frame(mx, my, mw, mh, C.N2);
    const bpm = `${BPM}`;
    g.text(mx + ((mw - g.textWidth(bpm)) >> 1), my + 3, bpm, C.INK);

    // Level meters, one per deck, scaled by the crossfader.
    const meterH = mh - 22;
    [0, 1].forEach((i) => {
      const x = mx + Math.round(mw * (i === 0 ? 0.28 : 0.62));
      const level = decks[i].gain * (0.35 + 0.65 * kick);
      const lit = Math.round(level * (meterH / 2));
      for (let k = 0; k < meterH / 2; k++) {
        const y = my + 11 + meterH - k * 2;
        const color = k < lit ? (k > meterH / 2 - 3 ? C.W3 : C.T3) : C.GRID;
        g.rect(x, y, 3, 1, color);
      }
    });

    // Crossfader slot and knob.
    const slotY = my + mh - 6;
    g.rect(mx + 3, slotY, mw - 6, 1, C.N2);
    const knobX = Math.round(mx + 3 + fader * (mw - 9));
    g.rect(knobX, slotY - 2, 3, 5, C.INK);

    g.text(decks[0].x - 1, deckY + r + 2 > H - 6 ? 2 : deckY + r + 2, "A", C.N2);
    g.text(decks[1].x - 1, deckY + r + 2 > H - 6 ? 2 : deckY + r + 2, "B", C.N2);
  };
}

function drawDeck(g: Gfx, cx: number, cy: number, r: number, spin: number, label: number, gain: number, kick: number) {
  g.disc(cx, cy, r, C.N1);
  g.ring(cx, cy, r, C.N2);
  for (let rr = r - 3; rr > r * 0.4; rr -= 3) g.ring(cx, cy, rr, C.GRID);
  const lr = Math.max(2, Math.round(r * 0.32));
  g.disc(cx, cy, lr, gain > 0.5 && kick > 0.6 ? C.T3 : label);
  g.px(cx, cy, C.INK);
  // A mark on the record so you can see it spin.
  for (let k = lr + 1; k < r - 1; k++) g.px(cx + Math.cos(spin) * k, cy + Math.sin(spin) * k, C.N3);
  // Tonearm.
  g.line(cx + r - 1, cy - r + 1, cx + Math.round(r * 0.55), cy - Math.round(r * 0.15), C.N3);
  g.rect(cx + Math.round(r * 0.55) - 1, cy - Math.round(r * 0.15) - 1, 2, 2, C.INK);
}
