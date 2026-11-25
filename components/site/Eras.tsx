"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { PixelField } from "@/components/pixel/PixelField";
import { useThemeName } from "@/components/site/ThemeSwitch";
import { ArrowUpRight } from "@/components/ui/icons";
import { Redacted } from "@/components/ui/Redacted";
import type { Era } from "@/lib/data";
import { C, Gfx } from "@/lib/scenes/engine";
import { sceneLUT, subscribeTheme, THEMES, type ThemeName } from "@/lib/theme";
import { cn, joinWords } from "@/lib/utils";

const Y0 = 2020;
/** The ruler always runs at least a year past today, so a chapter that just started still has room to show. */
const rulerEnd = (now: number) => Math.ceil(now + 1);

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

/** The field behind the map while scrubbing takes the color of the chapter you're in. */
const fieldTone = (theme: ThemeName, tone: Era["tone"]) => {
  const t = THEMES[theme];
  return tone === "warm" ? t.warmField : tone === "neutral" ? t.neutralField : t.field;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const nowYear = () => {
  const d = new Date();
  return d.getFullYear() + d.getMonth() / 12 + d.getDate() / 365;
};

const formatYear = (yr: number) => {
  const y = Math.floor(yr);
  return `${MONTHS[Math.min(11, Math.floor((yr - y) * 12))]} ${y}`;
};

const covering = (eras: Era[], yr: number) => eras.filter((e) => e.from <= yr && (e.to ?? Infinity) >= yr);

const scramble = (s: string, keep: number) =>
  [...s].map((ch) => (ch === " " || Math.random() < keep ? ch : "#%?*"[(Math.random() * 4) | 0])).join("");

/**
 * The eras as bands on a year ruler. Places sit on the top row, things built alongside
 * them on the bottom row, so the overlaps show. Anything past today is dashed.
 * Hovering a band or a card lights up both. Dragging along the map pulls the "now"
 * marker back in time: the chapters you were in at that moment light up.
 */
export function Eras({ eras }: { eras: Era[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [scrub, setScrub] = useState<number | null>(null);

  const here = scrub === null ? [] : covering(eras, scrub);
  const lit = scrub !== null ? here.map((e) => e.id) : active ? [active] : [];
  // The most recent chapter at that moment decides the tint.
  const latest = here.reduce<Era | null>((a, b) => (!a || b.from > a.from ? b : a), null);

  return (
    <div className="mt-10 sm:mt-14">
      <EraMap eras={eras} lit={lit} scrub={scrub} tint={latest?.tone ?? "neutral"} onActive={setActive} onScrub={setScrub} />

      <p className="label mt-3 flex min-h-[18px] items-center gap-2 text-[10.5px]">
        {scrub === null ? (
          <span className="text-faint">Drag along the timeline to travel back</span>
        ) : (
          <>
            <span className="text-ink">{formatYear(scrub)}</span>
            <span className="text-faint">·</span>
            <span className={latest ? TEXT_TONE[latest.tone] : "text-muted"}>
              {here.length ? joinWords(here.map((e) => e.title)) : "Before college"}
            </span>
          </>
        )}
      </p>

      <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {eras.map((era) => {
          const on = lit.includes(era.id);
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
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                {era.redacted ? <Redacted text={era.body} active={on} className="text-[13px] text-ink-2" /> : era.body}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function EraMap({
  eras,
  lit,
  scrub,
  tint,
  onActive,
  onScrub,
}: {
  eras: Era[];
  lit: string[];
  scrub: number | null;
  tint: Era["tone"];
  onActive: (id: string | null) => void;
  onScrub: (year: number | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const litRef = useRef(lit);
  const scrubRef = useRef(scrub);
  const redraw = useRef<() => void>(() => {});
  const release = useRef<() => void>(() => {});
  // Mount the tinted field on first use, then keep it so it can fade out.
  const [fieldOn, setFieldOn] = useState(false);
  const themeName = useThemeName();

  litRef.current = lit;
  scrubRef.current = scrub;
  const litKey = lit.join(",");
  useEffect(() => {
    redraw.current();
  }, [litKey, scrub]);
  useEffect(() => {
    if (scrub !== null) setFieldOn(true);
  }, [scrub]);

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
    // Ruler geometry from the last draw, for turning a pointer position into a year.
    const ruler = { pad: 2, W: 40, y1: rulerEnd(nowYear()) };

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
      const Y1 = rulerEnd(nowYr);
      const pad = 2;
      Object.assign(ruler, { pad, W, y1: Y1 });
      const x = (yr: number) => pad + Math.round(((yr - Y0) / (Y1 - Y0)) * (W - pad * 2 - 1));
      const barH = narrow ? 7 : 9;
      const laneY = narrow ? [7, 17] : [8, 21];
      const rulerY = laneY[1] + barH + (narrow ? 4 : 5);
      const scrubYr = scrubRef.current;
      const litIds = litRef.current;

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
        const on = litIds.includes(era.id);
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

        const room = Math.min(end, full) - start;
        const fits = (s: string) => g.textWidth(s) + 5 <= room;
        let name = fits(era.title) && !narrow ? era.title.toUpperCase() : fits(era.short) ? era.short : "";
        // A redacted band never spells its name out in full.
        if (name && era.redacted) name = scramble(name, on ? 0.7 : 0.35);
        if (grow >= 1 && name) g.text(start + 3, y0 + ((barH - 5) >> 1), name, on ? C.INK : hot);
      });

      // Today, and the scrub marker when someone is dragging.
      const nx = x(Math.min(nowYr, Y1));
      const blink = reduce || Math.floor(now / 600) % 2 === 0;
      if (scrubYr === null) {
        for (let yy = 4; yy < rulerY; yy += 2) g.px(nx, yy, C.INK);
        if (blink) g.rect(nx - 1, rulerY - 1, 3, 3, C.INK);
        const nowLabel = "NOW";
        g.text(Math.min(W - g.textWidth(nowLabel) - 1, nx - (g.textWidth(nowLabel) >> 1)), 0, nowLabel, C.INK);
      } else {
        for (let yy = 6; yy < rulerY; yy += 3) g.px(nx, yy, C.N2);
        const sx = x(scrubYr);
        for (let yy = 4; yy < rulerY; yy += 2) g.px(sx, yy, C.INK);
        g.rect(sx - 1, rulerY - 1, 3, 3, C.INK);
        const label = narrow ? String(Math.floor(scrubYr)) : formatYear(scrubYr).toUpperCase();
        const lx = Math.min(W - g.textWidth(label) - 1, Math.max(1, sx - (g.textWidth(label) >> 1)));
        g.text(lx, 0, label, C.INK);
      }

      const out = pixels;
      const buf = g.buf;
      const LUT = sceneLUT();
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

    const yearAt = (clientX: number) => {
      const r = canvas.getBoundingClientRect();
      const px = (clientX - r.left) / cell;
      const yr = Y0 + ((px - ruler.pad) / (ruler.W - ruler.pad * 2 - 1)) * (ruler.y1 - Y0);
      return Math.min(nowYear(), Math.max(Y0, yr));
    };

    // Let go and the marker eases back to today.
    let back = 0;
    const springBack = () => {
      cancelAnimationFrame(back);
      const from = scrubRef.current;
      if (from === null) return;
      const to = nowYear();
      if (reduce) {
        onScrub(null);
        return;
      }
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / 520);
        const e = 1 - Math.pow(1 - k, 3);
        if (k < 1) {
          onScrub(from + (to - from) * e);
          back = requestAnimationFrame(step);
        } else onScrub(null);
      };
      back = requestAnimationFrame(step);
    };
    release.current = springBack;

    let dragging = false;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      cancelAnimationFrame(back);
      dragging = true;
      canvas.setPointerCapture(e.pointerId);
      onActive(null);
      onScrub(yearAt(e.clientX));
    };
    const onMove = (e: PointerEvent) => {
      if (dragging) {
        onScrub(yearAt(e.clientX));
        return;
      }
      if (e.pointerType === "touch") return;
      const r = canvas.getBoundingClientRect();
      const px = (e.clientX - r.left) / cell;
      const py = (e.clientY - r.top) / cell;
      const hit = bands.find((b) => px >= b.x0 && px <= b.x1 && py >= b.y0 - 1 && py <= b.y1 + 1);
      onActive(hit ? hit.id : null);
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      springBack();
    };
    const onLeave = () => {
      if (!dragging) onActive(null);
    };

    layout();
    draw();
    const resizeObserver = new ResizeObserver(() => {
      layout();
      schedule();
    });
    resizeObserver.observe(wrap);
    const unsubscribeTheme = subscribeTheme(schedule);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && introStart < 0) introStart = performance.now();
        if (visible) schedule();
      },
      { threshold: 0.3 },
    );
    io.observe(wrap);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (timer) window.clearTimeout(timer);
      cancelAnimationFrame(back);
      resizeObserver.disconnect();
      unsubscribeTheme();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [eras, onActive, onScrub]);

  // Keyboard: arrows step a quarter of a year, Home jumps to the start, End or Escape comes back.
  const onKeyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const now = nowYear();
    const cur = scrub ?? now;
    let next: number | null | undefined;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(Y0, cur - 0.25);
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") next = cur + 0.25 >= now ? null : cur + 0.25;
    else if (e.key === "Home") next = Y0;
    else if (e.key === "End" || e.key === "Escape") next = null;
    if (next === undefined) return;
    e.preventDefault();
    if (next === null) release.current();
    else onScrub(next);
  };

  const here = covering(eras, scrub ?? nowYear());
  const valueText = `${scrub === null ? "Now" : formatYear(scrub)}: ${here.length ? joinWords(here.map((e) => e.title)) : "before college"}`;

  return (
    <div className="px-frame isolate overflow-hidden bg-panel px-3 py-4 sm:px-5 sm:py-5">
      {fieldOn ? (
        <PixelField
          palette={[...fieldTone(themeName, tint)]}
          originX={0.5}
          originY={0.45}
          radius={0.7}
          intensity={0.6}
          interactive={false}
          seed={31}
          className={cn("-z-10 transition-opacity duration-500", scrub !== null ? "opacity-100" : "opacity-0")}
        />
      ) : null}
      <div ref={wrapRef}>
        <canvas
          ref={canvasRef}
          tabIndex={0}
          role="slider"
          aria-label={`Timeline of eras from ${Y0} to now. Use the arrow keys to travel back in time.`}
          aria-valuemin={Y0}
          aria-valuemax={Math.round(nowYear() * 100) / 100}
          aria-valuenow={Math.round((scrub ?? nowYear()) * 100) / 100}
          aria-valuetext={valueText}
          onKeyDown={onKeyDown}
          onBlur={() => scrub !== null && release.current()}
          // The "now" values come from the visitor's clock, which can differ from the server's by a day.
          suppressHydrationWarning
          className="pixelated block cursor-grab touch-pan-y select-none active:cursor-grabbing"
        />
      </div>
    </div>
  );
}
