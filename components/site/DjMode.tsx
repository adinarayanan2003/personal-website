"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

import { BeatMakerButton } from "@/components/site/BeatMaker";
import { BPM, bands, getBpm, isOn, pulse, stop, subscribe, toggle } from "@/lib/dj";
import { hexToRGBA32 } from "@/lib/pixel";
import { getTheme, theme } from "@/lib/theme";

const ROWS = 7;
/** Spectrum colours for the current theme: bottom rows cool, top rows warm, like the mixer meters. */
let rampFor = "";
let RAMP: number[] = [];
let DIM = 0;
function spectrumColours() {
  if (rampFor !== getTheme()) {
    rampFor = getTheme();
    RAMP = theme().spectrum.map((c) => hexToRGBA32(c));
    DIM = hexToRGBA32(theme().spectrumBase);
  }
}

export function useDjOn() {
  return useSyncExternalStore(subscribe, isOn, () => false);
}

/**
 * Type "dj" anywhere (or press play on the DJing card) to start a short loop. While it
 * plays, a pixel spectrum runs along the bottom of the screen and a pill up top shows how
 * to stop it. Escape, typing "dj" again or the stop button ends it.
 */
export function DjMode() {
  const playing = useDjOn();
  const bpm = useSyncExternalStore(subscribe, getBpm, () => BPM);

  useEffect(() => {
    let last = "";
    let lastAt = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (e.key === "Escape" && isOn()) {
        stop();
        return;
      }
      const key = e.key.toLowerCase();
      const now = performance.now();
      if (key === "j" && last === "d" && now - lastAt < 900) {
        toggle();
        last = "";
        return;
      }
      last = key;
      lastAt = now;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!playing) return null;
  return (
    <>
      <Spectrum />
      <div className="fade-in pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <div
          role="status"
          className="glass px-frame px-sm pointer-events-auto flex h-10 items-center gap-3 pl-4 pr-1.5 font-mono text-[11.5px] uppercase tracking-[0.1em] text-ink-2 [--frame:var(--color-line-2)]"
        >
          <BeatDot />
          <span>DJ mode</span>
          <span className="text-faint">{bpm} BPM</span>
          <span className="hidden text-faint sm:inline">Esc to stop</span>
          <button
            type="button"
            onClick={stop}
            className="px-frame px-sm h-7 bg-ink px-3 text-[11px] font-medium text-bg [--frame:transparent] hover:bg-white"
          >
            Stop
          </button>
        </div>
      </div>
    </>
  );
}

/** A square that flashes on every kick. */
function BeatDot() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = pulse();
      if (ref.current) ref.current.style.opacity = String(0.25 + p * 0.75);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <span ref={ref} aria-hidden className="block size-[7px] bg-warm" />;
}

/** Pixel spectrum analyser pinned to the bottom edge of the viewport. */
function Spectrum() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let image: ImageData | null = null;
    let pixels: Uint32Array | null = null;
    let cols = 0;
    let peaks: number[] = [];
    const resize = () => {
      // Smaller pixels on phones, so the strip stays below the hero's caption line.
      const cell = window.innerWidth < 640 ? 3 : 4;
      cols = Math.ceil(window.innerWidth / cell);
      canvas.width = cols;
      canvas.height = ROWS;
      canvas.style.width = `${cols * cell}px`;
      canvas.style.height = `${ROWS * cell}px`;
      image = ctx.createImageData(cols, ROWS);
      pixels = new Uint32Array(image.data.buffer);
      peaks = new Array(cols).fill(0);
    };

    let raf = 0;
    let lastDraw = 0;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      // Stepped at about 20 fps, the same chunky motion as the rest of the pixel work.
      if (now - lastDraw < 50 || !image || !pixels) return;
      lastDraw = now;
      spectrumColours();
      const columnsPerBand = 3;
      const level = bands(Math.ceil(cols / columnsPerBand));
      pixels.fill(0);
      for (let x = 0; x < cols; x++) {
        // Mirror around the center, so the bass sits in the middle of the screen.
        const fromCenter = Math.abs(x - cols / 2) / (cols / 2);
        const band = Math.min(level.length - 1, Math.floor(fromCenter * level.length));
        const h = Math.round(level[band] * ROWS);
        peaks[x] = Math.max(h, peaks[x] - 0.35);
        for (let y = 0; y < ROWS; y++) {
          const row = ROWS - 1 - y;
          const i = row * cols + x;
          if (y < h) pixels[i] = RAMP[y];
          else if (y === Math.round(peaks[x]) && y > 0) pixels[i] = RAMP[Math.min(ROWS - 1, y)];
          else if (y === 0) pixels[i] = DIM;
        }
      }
      ctx.putImageData(image, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduce) raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pixelated fade-in pointer-events-none fixed bottom-0 left-0 z-40 block motion-reduce:hidden"
    />
  );
}

/** Play/stop control for the DJing card, so touch screens can start the set too. */
export function DjPlayButton() {
  const playing = useDjOn();
  return (
    <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5">
      <button type="button" onClick={toggle} aria-pressed={playing} className="text-link text-[14px]">
        {playing ? (
          <svg viewBox="0 0 8 8" aria-hidden className="size-2.5" shapeRendering="crispEdges" fill="currentColor">
            <rect x="1" y="1" width="6" height="6" />
          </svg>
        ) : (
          <svg viewBox="0 0 8 8" aria-hidden className="size-2.5" shapeRendering="crispEdges" fill="currentColor">
            <path d="M1 0h2v1H1zM1 1h3v1H1zM1 2h4v1H1zM1 3h5v2H1zM1 5h4v1H1zM1 6h3v1H1zM1 7h2v1H1z" />
          </svg>
        )}
        {playing ? "Stop the music" : "Play a short set"}
      </button>
      <BeatMakerButton />
      <span className="label hidden text-[10.5px] text-faint [@media(hover:hover)]:inline">or type DJ anywhere</span>
    </div>
  );
}
