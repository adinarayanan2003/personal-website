/**
 * DJ mode: a short house loop synthesized with the Web Audio API (no audio files),
 * plus a tiny store the visuals read from. Nothing here runs until someone asks for it
 * with a click or by typing "dj", so the browser's autoplay rules are always met.
 */

export const BPM = 124;

const BEAT = 60 / BPM;
const STEP = BEAT / 4; // one 16th note
const STEPS = 64; // four bars
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

const emit = () => listeners.forEach((fn) => fn());

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export const isOn = () => on;

/** 1 right on the kick, falling to 0 before the next one. 0 when the music is off. */
export function pulse() {
  if (!on || !ctx) return 0;
  const phase = ((ctx.currentTime - startTime) / BEAT) % 1;
  return phase < 0 ? 0 : Math.pow(1 - phase, 3);
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
  env(g, t, 0.32, STEP * 0.9);
  osc.connect(f).connect(g).connect(master!);
  osc.start(t);
  osc.stop(t + STEP);
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

function play(i: number, t: number) {
  const bar = Math.floor(i / 16);
  const s = i % 16;
  if (s % 4 === 0) kick(t);
  if (s === 4 || s === 12) hiss(t, "bandpass", 1500, 0.35, 0.16); // clap on 2 and 4
  if (s % 4 === 2) hiss(t, "highpass", 7000, 0.22, 0.09); // open hat on the offbeat
  else hiss(t, "highpass", 9000, 0.05, 0.03); // quiet 16th ticks
  if (s % 4 !== 0) bass(t, s % 4 === 2 ? ROOTS[bar] * 2 : ROOTS[bar], bar);
  if (s === 6 || s === 14) stab(t, CHORDS[bar]);
}

function tick() {
  if (!ctx) return;
  while (nextTime < ctx.currentTime + LOOKAHEAD) {
    play(step, nextTime);
    nextTime += STEP;
    step = (step + 1) % STEPS;
  }
}

export async function start() {
  if (on) return;
  if (!ctx) setup();
  const c = ctx!;
  await c.resume();
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
