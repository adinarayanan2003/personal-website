"use client";

import { useEffect, useRef, useState } from "react";

import { ArrowUpRight } from "@/components/ui/icons";
import type { Era } from "@/lib/data";
import { hexToRGBA32 } from "@/lib/pixel";
import { C, Gfx, PALETTE } from "@/lib/scenes/engine";
import { cn } from "@/lib/utils";

const LUT = new Uint32Array(PALETTE.map((hex, i) => (i === 0 ? 0 : hexToRGBA32(hex))));
const Y0 = 2020;
const Y1 = 2027;

/** [fill, highlight, hot] per tone. */
const TONES: Record<Era["tone"], readonly [number, number, number]> = {
  neutral: [C.N1, C.N2, C.N3],
  "teal-dim": [C.T1, C.T2, C.T3],
  teal: [C.T2, C.T3, C.T4],
  warm: [C.W1, C.W2, C.W3],
};

const TEXT_TONE: Record<Era["tone"], string> = {
  neutral: "text-ink-2",
  "teal-dim": "text-accent",
  teal: "text-accent-hi",
  warm: "text-warm",
};

const nowYear = () => {
  const d = new Date();
  return d.getFullYear() + d.getMonth() / 12 + d.getDate() / 365;
};

/**
 * The eras as bands on a year ruler. Places sit on the top row, things built alongside
 * them on the bottom row, so the overlaps show. Anything past today is dashed.
 * Hovering a band or a card lights up both.
 */
export function Eras({ eras }: { eras: Era[] }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="mt-10 sm:mt-14">
      <EraMap eras={eras} active={active} onActive={setActive} />
      <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {eras.map((era) => {
          const on = active === era.id;
          return (
            <li
              key={era.id}
              tabIndex={0}
              onPointerEnter={() => setActive(era.id)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(era.id)}
              onBlur={() => setActive(null)}
              className={cn(
                "px-frame flex flex-col bg-panel p-5 transition-colors duration-300 sm:p-6",
                on ? "bg-raise [--frame:var(--color-line-2)]" : "[--frame:var(--color-line)]",
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className={cn("font-mono text-[12.5px] uppercase tracking-[0.06em]", TEXT_TONE[era.tone])}>
                  {era.years}
                </p>
                <p className="label text-[10.5px]">{era.kicker}</p>
              </div>
              <h3 className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-ink">
                {era.href ? (
                  <a
                    href={era.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1.5 hover:text-warm"
                  >
                    {era.title}
                    <ArrowUpRight className="size-3.5 text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                ) : (
                  era.title
                )}
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{era.body}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function EraMap({
  eras,
  active,
  onActive,
}: {
  eras: Era[];
  active: string | null;
  onActive: (id: string | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const redraw = useRef<() => void>(() => {});

  activeRef.current = active;
  useEffect(() => {
    redraw.current();
  }, [active]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const g = new Gfx();
    let image: ImageData | null = null;
    let pixels: Uint32Array | null = null;
    let cell = 4;
    let narrow = false;
    let introStart = -1;
    let raf = 0;
    let timer = 0;
    let visible = false;
    let bands: { id: string; x0: number; x1: number; y0: number; y1: number }[] = [];

    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      narrow = rect.width < 640;
      cell = Math.max(2, Math.round((narrow ? 3 : 4) * dpr)) / dpr;
      const cols = Math.max(40, Math.floor(rect.width / cell));
      const rows = narrow ? 39 : 46;
      canvas.width = cols;
      canvas.height = rows;
      canvas.style.width = `${cols * cell}px`;
      canvas.style.height = `${rows * cell}px`;
      g.resize(cols, rows);
      image = ctx.createImageData(cols, rows);
      pixels = new Uint32Array(image.data.buffer);
    };

    const draw = () => {
      raf = 0;
      if (!image || !pixels) return;
      const now = performance.now();
      const W = g.cols;
      const H = g.rows;
      const intro = reduce ? 1 : introStart < 0 ? 0 : Math.min(1, (now - introStart) / 1400);
      const nowYr = nowYear();
      const pad = 2;
      const x = (yr: number) => pad + Math.round(((yr - Y0) / (Y1 - Y0)) * (W - pad * 2 - 1));
      const barH = narrow ? 7 : 9;
      const laneY = narrow ? [7, 17] : [8, 21];
      const rulerY = laneY[1] + barH + (narrow ? 4 : 5);

      g.clear();

      // Year grid and ruler.
      for (let yr = Y0; yr <= Y1; yr++) {
        const xx = x(yr);
        for (let yy = 5; yy < rulerY; yy += 2) g.px(xx, yy, C.GRID);
        g.rect(xx, rulerY, 1, 3, C.N2);
        const label = narrow ? `'${String(yr).slice(2)}` : String(yr);
        const lx = Math.min(W - g.textWidth(label) - 1, Math.max(1, xx - (g.textWidth(label) >> 1)));
        if (yr < Y1 && (!narrow || yr % 2 === 0)) g.text(lx, rulerY + 5, label, C.N2);
      }
      g.rect(pad, rulerY, W - pad * 2, 1, C.N2);

      // Bands grow in from the left, one after another.
      bands = [];
      eras.forEach((era, i) => {
        const [fill, hi, hot] = TONES[era.tone];
        const on = activeRef.current === era.id;
        const start = x(era.from);
        const endYr = era.to ?? Y1 - 0.02;
        const full = x(endYr);
        // Staggered so the last band finishes exactly when the intro does.
        const stagger = 0.15;
        const grow = Math.min(1, Math.max(0, (intro - i * stagger) / (1 - stagger * (eras.length - 1))));
        const end = Math.round(start + (full - start) * grow);
        const nowX = x(Math.min(nowYr, Y1));
        const y0 = laneY[era.lane] - (on ? 1 : 0);
        bands.push({ id: era.id, x0: start, x1: full, y0: laneY[era.lane], y1: laneY[era.lane] + barH });
        if (end <= start) return;

        const solidEnd = Math.min(end, nowX);
        if (solidEnd > start) {
          g.rect(start, y0, solidEnd - start, barH, on ? hi : fill);
          g.rect(start, y0, solidEnd - start, 1, on ? hot : hi);
          g.rect(start, y0, 1, barH, on ? hot : hi);
        }
        // Future part: dashed outline only.
        if (end > nowX) {
          for (let xx = Math.max(start, nowX); xx < end; xx++) {
            if (Math.floor(xx / 2) % 2 === 0) {
              g.px(xx, y0, hi);
              g.px(xx, y0 + barH - 1, hi);
            }
          }
          if (era.to === null && grow >= 1) {
            // Open-ended arrow.
            const ax = end;
            for (let k = 0; k < 3; k++) g.rect(ax - 2 + k, y0 + 2 + k, 1, barH - 4 - k * 2, hot);
          }
        }

        const name = narrow ? era.short : era.title.toUpperCase();
        const tw = g.textWidth(name);
        const room = (era.to === null ? Math.min(end, nowX) : Math.min(end, full)) - start;
        if (grow >= 1 && tw + 5 <= room) g.text(start + 3, y0 + ((barH - 5) >> 1), name, on ? C.INK : hot);
        else if (grow >= 1 && g.textWidth(era.short) + 5 <= room) g.text(start + 3, y0 + ((barH - 5) >> 1), era.short, on ? C.INK : hot);
      });

      // Today.
      const nx = x(Math.min(nowYr, Y1));
      const blink = reduce || Math.floor(now / 600) % 2 === 0;
      for (let yy = 4; yy < rulerY; yy += 2) g.px(nx, yy, C.INK);
      if (blink) g.rect(nx - 1, rulerY - 1, 3, 3, C.INK);
      const nowLabel = "NOW";
      g.text(Math.min(W - g.textWidth(nowLabel) - 1, nx - (g.textWidth(nowLabel) >> 1)), 0, nowLabel, C.INK);

      const out = pixels;
      const buf = g.buf;
      for (let i = 0; i < buf.length; i++) out[i] = LUT[buf[i]];
      ctx.putImageData(image, 0, 0);

      if (!reduce && visible) {
        // Smooth while the bands grow in, then a slow tick for the blinking marker.
        if (intro < 1) raf = requestAnimationFrame(draw);
        else
          timer = window.setTimeout(() => {
            timer = 0;
            raf = requestAnimationFrame(draw);
          }, 600);
      }
    };

    const schedule = () => {
      if (timer) {
        window.clearTimeout(timer);
        timer = 0;
      }
      if (!raf) raf = requestAnimationFrame(draw);
    };
    redraw.current = schedule;

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const px = (e.clientX - r.left) / cell;
      const py = (e.clientY - r.top) / cell;
      const hit = bands.find((b) => px >= b.x0 && px <= b.x1 && py >= b.y0 - 1 && py <= b.y1 + 1);
      onActive(hit ? hit.id : null);
    };
    const onLeave = () => onActive(null);

    layout();
    draw();
    const resizeObserver = new ResizeObserver(() => {
      layout();
      schedule();
    });
    resizeObserver.observe(wrap);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && introStart < 0) introStart = performance.now();
        if (visible) schedule();
      },
      { threshold: 0.3 },
    );
    io.observe(wrap);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (timer) window.clearTimeout(timer);
      resizeObserver.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [eras, onActive]);

  return (
    <div className="px-frame bg-panel px-3 py-4 sm:px-5 sm:py-5">
      <div ref={wrapRef}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Timeline of eras from ${Y0} to now: ${eras.map((e) => `${e.title}, ${e.years}`).join("; ")}.`}
          className="pixelated block"
        />
      </div>
    </div>
  );
}
