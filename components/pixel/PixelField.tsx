"use client";

import { useEffect, useRef } from "react";

import { createValueNoise, hexToRGBA32, maskGain, renderField, TEAL, type FieldMask, type FieldShape } from "@/lib/pixel";
import { cn } from "@/lib/utils";

type PixelFieldProps = Partial<Omit<FieldShape, "levels">> & {
  className?: string;
  /** Size of one pixel in CSS px. Snapped so it lands on whole device pixels. */
  cell?: number;
  /** Colors for levels 1..n. Level 0 is transparent, so the parent's background shows. */
  palette?: string[];
  /** Ambient animation steps per second. Low on purpose, it gives the stepped pixel feel. */
  fps?: number;
  /** Light up pixels under the pointer (skipped on touch devices). */
  interactive?: boolean;
  seed?: number;
  /** Where the field thins out: "hero" (behind the copy and at the bottom), "contact" (toward the top). */
  mask?: FieldMask;
};

type TrailPoint = { x: number; y: number; life: number };

const TRAIL_SIGMA = 3.4;
const TRAIL_REACH = 8;
const TRAIL_MAX = 56;

export function PixelField({
  className,
  cell = 6,
  palette = TEAL,
  fps = 12,
  interactive = true,
  seed = 11,
  originX = 0.76,
  originY = 0.4,
  radius = 0.6,
  intensity = 0.8,
  mask = "none",
}: PixelFieldProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteKey = palette.join(",");

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = paletteKey.split(",");
    const lut = new Uint32Array([0, ...colors.map((c) => hexToRGBA32(c))]);
    const shape: FieldShape = { originX, originY, radius, intensity, levels: colors.length };
    const noise = createValueNoise(seed);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const pointerOn = interactive && finePointer && !reduceMotion;

    let cols = 0;
    let rows = 0;
    let cssCell = cell;
    let image: ImageData | null = null;
    let pixels: Uint32Array | null = null;
    let levels = new Uint8Array(0);
    let boost = new Float32Array(0);
    let gain: Float32Array | null = null;
    const wideQuery = window.matchMedia("(min-width: 1024px)");

    const trail: TrailPoint[] = [];
    let lastPointer: { x: number; y: number } | null = null;

    let raf = 0;
    let timer = 0;
    let inView = false;
    let pageVisible = document.visibilityState === "visible";
    let lastStep = -1;
    let lastTime = performance.now();
    const start = lastTime;
    let shown = false;

    const draw = (t: number) => {
      if (!image || !pixels) return;
      const useBoost = trail.length > 0;
      if (useBoost) buildBoost();
      renderField(levels, cols, rows, t, shape, noise, useBoost ? boost : null, gain);
      for (let i = 0; i < levels.length; i++) pixels[i] = lut[levels[i]];
      ctx.putImageData(image, 0, 0);
      if (!shown) {
        shown = true;
        canvas.style.opacity = "1";
      }
    };

    const buildBoost = () => {
      boost.fill(0);
      const twoSigma2 = 2 * TRAIL_SIGMA * TRAIL_SIGMA;
      for (const p of trail) {
        const x0 = Math.max(0, Math.floor(p.x - TRAIL_REACH));
        const x1 = Math.min(cols - 1, Math.ceil(p.x + TRAIL_REACH));
        const y0 = Math.max(0, Math.floor(p.y - TRAIL_REACH));
        const y1 = Math.min(rows - 1, Math.ceil(p.y + TRAIL_REACH));
        const strength = 0.46 * p.life * p.life;
        for (let y = y0; y <= y1; y++) {
          const dy = y - p.y;
          for (let x = x0; x <= x1; x++) {
            const dx = x - p.x;
            boost[y * cols + x] += strength * Math.exp(-(dx * dx + dy * dy) / twoSigma2);
          }
        }
      }
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      cssCell = Math.max(2, Math.round(cell * dpr)) / dpr;
      const rect = wrap.getBoundingClientRect();
      const nextCols = Math.max(8, Math.ceil(rect.width / cssCell));
      const nextRows = Math.max(8, Math.ceil(rect.height / cssCell));
      canvas.style.width = `${nextCols * cssCell}px`;
      canvas.style.height = `${nextRows * cssCell}px`;
      if (nextCols === cols && nextRows === rows) return;
      cols = nextCols;
      rows = nextRows;
      canvas.width = cols;
      canvas.height = rows;
      image = ctx.createImageData(cols, rows);
      pixels = new Uint32Array(image.data.buffer);
      levels = new Uint8Array(cols * rows);
      boost = new Float32Array(cols * rows);
      gain = maskGain(mask, cols, rows, wideQuery.matches);
      lastStep = -1;
      draw(reduceMotion ? 4 : ((performance.now() - start) / 1000));
    };

    const frame = (now: number) => {
      raf = 0;
      if (!inView || !pageVisible) return;
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      if (trail.length) {
        for (let i = trail.length - 1; i >= 0; i--) {
          trail[i].life -= dt * 1.5;
          if (trail[i].life <= 0) trail.splice(i, 1);
        }
      }

      const step = Math.floor(((now - start) / 1000) * fps);
      if (step !== lastStep || trail.length) {
        lastStep = step;
        draw(step / fps);
      }
      schedule();
    };

    // Every animation frame while the pointer trail is alive, otherwise wake once per step.
    const schedule = () => {
      if (raf || timer) return;
      if (trail.length) {
        raf = requestAnimationFrame(frame);
      } else {
        timer = window.setTimeout(() => {
          timer = 0;
          raf = requestAnimationFrame(frame);
        }, 1000 / fps);
      }
    };

    const play = () => {
      if (reduceMotion || !inView || !pageVisible) return;
      if (timer && trail.length) {
        window.clearTimeout(timer);
        timer = 0;
      }
      if (!raf && !timer) lastTime = performance.now();
      schedule();
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      if (timer) window.clearTimeout(timer);
      raf = 0;
      timer = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / cssCell;
      const y = (e.clientY - rect.top) / cssCell;
      if (x < 0 || y < 0 || x > cols || y > rows) {
        lastPointer = null;
        return;
      }
      const from = lastPointer ?? { x, y };
      const dist = Math.hypot(x - from.x, y - from.y);
      const steps = Math.max(1, Math.min(10, Math.ceil(dist / 2)));
      for (let s = 1; s <= steps; s++) {
        trail.push({ x: from.x + ((x - from.x) * s) / steps, y: from.y + ((y - from.y) * s) / steps, life: 1 });
      }
      if (trail.length > TRAIL_MAX) trail.splice(0, trail.length - TRAIL_MAX);
      lastPointer = { x, y };
      play();
    };

    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      if (pageVisible) play();
      else stop();
    };

    const onWide = () => {
      gain = maskGain(mask, cols, rows, wideQuery.matches);
      draw(reduceMotion ? 4 : (performance.now() - start) / 1000);
    };
    wideQuery.addEventListener("change", onWide);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) play();
        else stop();
      },
      { rootMargin: "80px" },
    );
    io.observe(wrap);

    document.addEventListener("visibilitychange", onVisibility);
    if (pointerOn) window.addEventListener("pointermove", onPointerMove, { passive: true });

    resize();

    return () => {
      stop();
      resizeObserver.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      wideQuery.removeEventListener("change", onWide);
    };
  }, [cell, paletteKey, fps, interactive, seed, originX, originY, radius, intensity, mask]);

  return (
    <div ref={wrapRef} aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        tabIndex={-1}
        className="pixelated absolute left-0 top-0 block opacity-0 transition-opacity duration-1000"
      />
    </div>
  );
}
