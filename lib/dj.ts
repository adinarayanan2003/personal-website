/**
 * DJ mode: house music synthesized with the Web Audio API (no audio files), plus a tiny
 * store the visuals read from. Two ways to play:
 * - the "set": a fixed four-bar loop (type "dj", or press play on the DJing card);
 * - a pattern: 16 steps x 5 tracks from the beat-maker, which also fits in a share link.
 * Nothing runs until someone asks with a click or a key press, so autoplay rules are met.
 */

export const BPM = 124;
export const TRACKS = ["Kick", "Clap", "Hat", "Bass", "Chord"] as const;
export const STEPS_PER_BAR = 16;
export const BPM_MIN = 96;
export const BPM_MAX = 150;

export type Pattern = { bpm: number; steps: boolean[][] };

const SET_STEPS = 64; // the set is four bars
const LOOKAHEAD = 0.12; // seconds of audio scheduled ahead of the clock

// A minor, four bars: Am, F, C, G. Roots in Hz.
const ROOTS = [55, 43.65, 65.41, 49];
const CHORDS = [
  [220, 261.63, 329.63],
  [174.61, 220, 261.63],
  [196, 261.63, 329.63],
  [196, 246.94, 293.66],
];

type Listener = () => void;

let on = false;
let mode: "set" | "pattern" = "set";
let pattern: Pattern | null = null;
let bpm = BPM;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let noise: AudioBuffer | null = null;
let freq: Uint8Array<ArrayBuffer> | null = null;
let timer = 0;
let nextTime = 0;
let step = 0;
let startTime = 0;
const listeners = new Set<Listener>();

const beatLen = () => 60 / bpm;
const stepLen = () => beatLen() / 4;
const emit = () => listeners.forEach((fn) => fn());

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export const isOn = () => on;
export const getMode = () => mode;
export const getBpm = () => bpm;

/** 1 right on the beat, falling to 0 before the next one. 0 when the music is off. */
export function pulse() {
  if (!on || !ctx) return 0;
  const phase = ((ctx.currentTime - startTime) / beatLen()) % 1;
  return phase < 0 ? 0 : Math.pow(1 - phase, 3);
}

/** The 16th step being heard right now (0..15), or -1 when off. For the beat-maker's playhead. */
export function currentStep() {
  if (!on || !ctx) return -1;
  const elapsed = ctx.currentTime - startTime;
  return elapsed < 0 ? -1 : Math.floor(elapsed / stepLen()) % STEPS_PER_BAR;
}

/** Energy in `count` frequency bands, each 0..1, low to high. Zeros when off. */
export function bands(count: number) {
  const out = new Array<number>(count).fill(0);
  if (!on || !analyser || !freq) return out;
  analyser.getByteFrequencyData(freq);
  // Log-spaced bands so the bass doesn't take up the whole meter.
  const n = freq.length;
  for (let b = 0; b < count; b++) {
    const lo = Math.floor(Math.pow(n, b / count));
    const hi = Math.max(lo + 1, Math.floor(Math.pow(n, (b + 1) / count)));
    let sum = 0;
    for (let i = lo; i < hi; i++) sum += freq[i];
    // Highs carry far less energy than the kick, so tilt the meter up toward them.
    const tilt = 0.75 + (b / Math.max(1, count - 1)) * 1.5;
    out[b] = Math.min(1, (sum / (hi - lo) / 255) * tilt);
  }
  return out;
}

function setup() {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 4;
  master = ctx.createGain();
  master.gain.value = 0;
  analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.72;
  freq = new Uint8Array(analyser.frequencyBinCount);

  master.connect(comp);
  comp.connect(analyser);
  analyser.connect(ctx.destination);

  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
}

function env(gain: GainNode, t: number, peak: number, decay: number) {
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
}

function kick(t: number) {
  const c = ctx!;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  env(g, t, 1, 0.42);
  osc.connect(g).connect(master!);
  osc.start(t);
  osc.stop(t + 0.45);
}

function hiss(t: number, type: BiquadFilterType, hz: number, peak: number, decay: number) {
  const c = ctx!;
  const src = c.createBufferSource();
  src.buffer = noise;
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = hz;
  const g = c.createGain();
  env(g, t, peak, decay);
  src.connect(f).connect(g).connect(master!);
  src.start(t, Math.random() * 0.5);
  src.stop(t + decay + 0.02);
}

function bass(t: number, hz: number, bar: number) {
  const c = ctx!;
  const osc = c.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = hz;
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  // The filter opens a little over the four bars, then resets: some movement without a melody.
  f.frequency.value = 260 + bar * 90;
  f.Q.value = 6;
  const g = c.createGain();
  env(g, t, 0.32, stepLen() * 0.9);
  osc.connect(f).connect(g).connect(master!);
  osc.start(t);
  osc.stop(t + stepLen());
}

function stab(t: number, notes: number[]) {
  const c = ctx!;
  for (const hz of notes) {
    const osc = c.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = hz;
    const g = c.createGain();
    env(g, t, 0.07, 0.3);
    osc.connect(g).connect(master!);
    osc.start(t);
    osc.stop(t + 0.32);
  }
}

const clap = (t: number) => hiss(t, "bandpass", 1500, 0.35, 0.16);
const hat = (t: number) => hiss(t, "highpass", 7000, 0.22, 0.09);

function playSet(i: number, t: number) {
  const bar = Math.floor(i / 16);
  const s = i % 16;
  if (s % 4 === 0) kick(t);
  if (s === 4 || s === 12) clap(t); // on 2 and 4
  if (s % 4 === 2) hat(t); // open hat on the offbeat
  else hiss(t, "highpass", 9000, 0.05, 0.03); // quiet 16th ticks
  if (s % 4 !== 0) bass(t, s % 4 === 2 ? ROOTS[bar] * 2 : ROOTS[bar], bar);
  if (s === 6 || s === 14) stab(t, CHORDS[bar]);
}

function playPatternStep(i: number, t: number) {
  if (!pattern) return;
  const s = i % STEPS_PER_BAR;
  // The one-bar pattern rides the four-bar chord progression underneath, so it never sounds static.
  const bar = Math.floor(i / STEPS_PER_BAR) % 4;
  const [k, c, h, b, ch] = pattern.steps;
  if (k[s]) kick(t);
  if (c[s]) clap(t);
  if (h[s]) hat(t);
  if (b[s]) bass(t, s % 2 ? ROOTS[bar] * 2 : ROOTS[bar], bar);
  if (ch[s]) stab(t, CHORDS[bar]);
}

function tick() {
  if (!ctx) return;
  const loop = mode === "set" ? SET_STEPS : STEPS_PER_BAR * 4;
  while (nextTime < ctx.currentTime + LOOKAHEAD) {
    if (mode === "set") playSet(step, nextTime);
    else playPatternStep(step, nextTime);
    nextTime += stepLen();
    step = (step + 1) % loop;
  }
}

async function begin() {
  if (!ctx) setup();
  const c = ctx!;
  await c.resume();
  window.clearInterval(timer);
  step = 0;
  nextTime = c.currentTime + 0.06;
  startTime = nextTime;
  master!.gain.cancelScheduledValues(c.currentTime);
  master!.gain.setValueAtTime(0, c.currentTime);
  master!.gain.linearRampToValueAtTime(0.55, c.currentTime + 0.3);
  tick();
  timer = window.setInterval(tick, 25);
  on = true;
  emit();
}

/** Start the built-in set. */
export async function start() {
  if (on && mode === "set") return;
  mode = "set";
  bpm = BPM;
  await begin();
}

/** Play a beat-maker pattern, or switch to it if something is already playing. */
export async function playPattern(p: Pattern) {
  pattern = p;
  const wasPattern = on && mode === "pattern";
  mode = "pattern";
  if (wasPattern) {
    setBpm(p.bpm);
    return;
  }
  bpm = p.bpm;
  await begin();
}

/** Swap the pattern while it plays; the next scheduled step picks it up. */
export function updatePattern(p: Pattern) {
  pattern = p;
  if (on && mode === "pattern" && p.bpm !== bpm) setBpm(p.bpm);
}

function setBpm(next: number) {
  if (!ctx || !on) {
    bpm = next;
    return;
  }
  // Keep the playhead where it is: re-anchor the start so the current step stays current.
  const now = ctx.currentTime;
  const stepsDone = (now - startTime) / stepLen();
  bpm = next;
  startTime = now - stepsDone * stepLen();
  emit();
}

export function stop() {
  if (!on || !ctx || !master) return;
  const c = ctx;
  window.clearInterval(timer);
  master.gain.cancelScheduledValues(c.currentTime);
  master.gain.setValueAtTime(master.gain.value, c.currentTime);
  master.gain.linearRampToValueAtTime(0, c.currentTime + 0.35);
  window.setTimeout(() => {
    if (!on) void c.suspend();
  }, 450);
  on = false;
  emit();
}

export function toggle() {
  if (on) stop();
  else void start();
}

/* ---------- Patterns: defaults and share-link encoding ---------- */

const row = (s: string) => [...s].map((ch) => ch === "x");

/** A four-on-the-floor starting point, so the grid never opens empty. */
export const DEFAULT_PATTERN: Pattern = {
  bpm: BPM,
  steps: [
    row("x...x...x...x..."),
    row("....x.......x..."),
    row("..x...x...x...x."),
    row(".x.x.xx..x.x.x.x"),
    row("......x.......x."),
  ],
};

export const emptyPattern = (b = BPM): Pattern => ({
  bpm: b,
  steps: TRACKS.map(() => new Array<boolean>(STEPS_PER_BAR).fill(false)),
});

/** "1-124-<20 hex digits>": version, tempo, then 80 bits (5 tracks x 16 steps). */
export function encodePattern(p: Pattern) {
  const hex = p.steps
    .map((r) => {
      let n = 0;
      r.forEach((on, i) => {
        if (on) n |= 1 << (15 - i);
      });
      return n.toString(16).padStart(4, "0");
    })
    .join("");
  return `1-${p.bpm}-${hex}`;
}

export function decodePattern(code: string): Pattern | null {
  const m = /^1-(\d{2,3})-([0-9a-f]{20})$/i.exec(code.trim());
  if (!m) return null;
  const b = Math.min(BPM_MAX, Math.max(BPM_MIN, Number(m[1])));
  const steps = TRACKS.map((_, t) => {
    const n = parseInt(m[2].slice(t * 4, t * 4 + 4), 16);
    return Array.from({ length: STEPS_PER_BAR }, (_, i) => Boolean(n & (1 << (15 - i))));
  });
  return { bpm: b, steps };
}

/** A random but musical pattern: kick on the beat most of the time, sparser chords. */
export function randomPattern(b = BPM): Pattern {
  const odds = [0.12, 0.12, 0.45, 0.4, 0.14];
  const steps = TRACKS.map((_, t) =>
    Array.from({ length: STEPS_PER_BAR }, (_, i) => {
      if (t === 0 && i % 4 === 0) return Math.random() < 0.9;
      if (t === 1 && (i === 4 || i === 12)) return Math.random() < 0.85;
      return Math.random() < odds[t];
    }),
  );
  return { bpm: b, steps };
}
