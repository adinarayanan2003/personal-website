"use client";

import { useEffect, useRef } from "react";

import { hexToRGBA32 } from "@/lib/pixel";
import { SCENES, type SceneName } from "@/lib/scenes";
import { BAYER_8, Gfx, PALETTE, type Pointer, type Scene } from "@/lib/scenes/engine";
import { cn } from "@/lib/utils";

const LUT = new Uint32Array(PALETTE.map((hex, i) => (i === 0 ? 0 : hexToRGBA32(hex))));
const REVEAL_MS = 560;
const STILL_AT = 3.4;

type PixelSceneProps = {
  name: SceneName;
  /** What the scene shows, for screen readers. */
  label: string;
  className?: string;
  /** Pixel size in CSS px. Defaults to roughly 150 columns across. */
  cell?: number;
  /** Animation steps per second when idle. Hovering bumps it to 30. */
  fps?: number;
  /** When false the scene stops; flipping back to true replays the dissolve-in. */
  active?: boolean;
  /** Stop drawing without replaying the dissolve (used when a stacked card is covered). */
  paused?: boolean;
  seed?: number;
};

/** A live pixel illustration that shows how a project works, and reacts to the pointer. */
export function PixelScene({
  name,
  label,
  className,
  cell,
  fps = 15,
  active = true,
  paused = false,
  seed = 7,
}: PixelSceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flags = useRef({ active, paused });
  const kick = useRef<() => void>(() => {});

  flags.current = { active, paused };

  useEffect(() => {
    kick.current();
  }, [active, paused]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const g = new Gfx();
    let scene: Scene = SCENES[name](seed);
    let image: ImageData | null = null;
    let pixels: Uint32Array | null = null;
    let cssCell = 4;

    let pointer: Pointer = null;
    let touchUntil = 0;

    let raf = 0;
    let timer = 0;
    let inView = false;
    let pageVisible = document.visibilityState === "visible";
    let t = 0;
    let last = performance.now();
    let revealStart = -1;
    let revealPending = true;
    let wasActive = flags.current.active;

    const running = () =>
      !reduceMotion && inView && pageVisible && flags.current.active && !flags.current.paused;

    const currentPointer = (now: number) => {
      if (!pointer) return null;
      if (touchUntil && now > touchUntil) {
        pointer = null;
        touchUntil = 0;
        return null;
      }
      return pointer;
    };

    const draw = (now: number, advance = true) => {
      if (!image || !pixels) return;
      const dt = advance ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      t += dt;

      g.clear();
      scene({ g, t, dt, pointer: currentPointer(now) });

      if (revealPending && inView) {
        revealPending = false;
        revealStart = now;
      }
      let progress = 1;
      if (revealStart >= 0) {
        progress = (now - revealStart) / REVEAL_MS;
        if (progress >= 1) {
          progress = 1;
          revealStart = -1;
        }
      }

      const buf = g.buf;
      const cols = g.cols;
      if (progress < 1) {
        for (let i = 0; i < buf.length; i++) {
          const x = i % cols;
          const y = (i / cols) | 0;
          const threshold = BAYER_8[((y & 7) << 3) | (x & 7)] * 0.5 + (x / cols) * 0.5;
          pixels[i] = threshold <= progress ? LUT[buf[i]] : 0;
        }
      } else {
        for (let i = 0; i < buf.length; i++) pixels[i] = LUT[buf[i]];
      }
      ctx.putImageData(image, 0, 0);
    };

    const renderStill = () => {
      scene = SCENES[name](seed);
      t = 0;
      const step = 1 / 15;
      while (t < STILL_AT) {
        g.clear();
        scene({ g, t, dt: step, pointer: null });
        t += step;
      }
      revealPending = false;
      revealStart = -1;
      draw(performance.now(), false);
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = window.devicePixelRatio || 1;
      const target = cell ?? Math.max(2, Math.min(5, Math.round(rect.width / 150)));
      cssCell = Math.max(2, Math.round(target * dpr)) / dpr;
      const cols = Math.max(24, Math.floor(rect.width / cssCell));
      const rows = Math.max(16, Math.floor(rect.height / cssCell));
      canvas.style.width = `${cols * cssCell}px`;
      canvas.style.height = `${rows * cssCell}px`;
      if (cols === g.cols && rows === g.rows) return;
      g.resize(cols, rows);
      canvas.width = cols;
      canvas.height = rows;
      image = ctx.createImageData(cols, rows);
      pixels = new Uint32Array(image.data.buffer);
      scene = SCENES[name](seed);
      if (reduceMotion) renderStill();
      else draw(performance.now(), false);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!running()) return;
      draw(now);
      schedule();
    };

    const schedule = () => {
      if (raf || timer) return;
      const interval = pointer ? 1000 / 30 : 1000 / fps;
      timer = window.setTimeout(() => {
        timer = 0;
        raf = requestAnimationFrame(frame);
      }, interval);
    };

    const play = () => {
      if (!running()) return;
      if (!raf && !timer) last = performance.now();
      schedule();
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      if (timer) window.clearTimeout(timer);
      raf = 0;
      timer = 0;
    };

    kick.current = () => {
      const isActive = flags.current.active;
      if (isActive && !wasActive) revealPending = true;
      wasActive = isActive;
      if (running()) play();
      else stop();
    };

    const toCells = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / cssCell, y: (e.clientY - r.top) / cssCell };
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer = toCells(e);
      touchUntil = 0;
      play();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "touch") pointer = null;
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      pointer = toCells(e);
      touchUntil = performance.now() + 2600;
      play();
    };
    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      kick.current();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        kick.current();
      },
      { rootMargin: "120px" },
    );
    io.observe(wrap);

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointerdown", onDown);
    document.addEventListener("visibilitychange", onVisibility);

    resize();

    return () => {
      stop();
      resizeObserver.disconnect();
      io.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [name, cell, fps, seed]);

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label={label}
      className={cn("grid place-items-center overflow-hidden", className)}
    >
      <canvas ref={canvasRef} className="pixelated block" />
    </div>
  );
}
