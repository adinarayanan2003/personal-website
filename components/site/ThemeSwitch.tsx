"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { BAYER_4 as BAYER, hexToRGBA32 } from "@/lib/pixel";
import { cycleTheme, getTheme, setTheme, subscribeTheme, THEME_ORDER, THEMES, type ThemeName } from "@/lib/theme";
import { cn } from "@/lib/utils";

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

export function useThemeName(): ThemeName {
  return useSyncExternalStore(subscribeTheme, getTheme, () => "pixel");
}

/**
 * The Konami code (↑ ↑ ↓ ↓ ← → ← → B A) swaps to the next theme. Every change, wherever it
 * came from, gets a pixel wipe across the screen and a small note naming the theme.
 */
export function ThemeKeys() {
  const name = useThemeName();
  const prev = useRef(name);
  const [change, setChange] = useState<{ id: number; theme: ThemeName } | null>(null);
  const clear = useCallback(() => setChange(null), []);

  useEffect(() => {
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      const key = e.key.toLowerCase();
      pos = key === KONAMI[pos] ? pos + 1 : key === KONAMI[0] ? 1 : 0;
      if (pos === KONAMI.length) {
        pos = 0;
        cycleTheme();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Only real changes count: comparing with the previous name (rather than skipping the
  // first run) stays correct when React runs effects twice in development.
  useEffect(() => {
    if (prev.current === name) return;
    prev.current = name;
    setChange((c) => ({ id: (c?.id ?? 0) + 1, theme: name }));
  }, [name]);

  if (!change) return null;
  return (
    <>
      <ThemeWipe key={`wipe-${change.id}`} theme={change.theme} />
      <ThemeNote key={`note-${change.id}`} theme={change.theme} onDone={clear} />
    </>
  );
}

/** A diagonal band of dithered pixels in the new palette sweeps across the screen once. */
function ThemeWipe({ theme }: { theme: ThemeName }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cell = window.innerWidth < 640 ? 6 : 10;
    const cols = Math.ceil(window.innerWidth / cell);
    const rows = Math.ceil(window.innerHeight / cell);
    canvas.width = cols;
    canvas.height = rows;
    canvas.style.width = `${cols * cell}px`;
    canvas.style.height = `${rows * cell}px`;
    const image = ctx.createImageData(cols, rows);
    const px = new Uint32Array(image.data.buffer);
    const t = THEMES[theme];
    const ramp = [...t.field, t.scene[5]].map((c) => hexToRGBA32(c)); // dim to bright, brightest at the leading edge
    const BAND = 0.16;
    const DURATION = 650;
    const start = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const k = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - k, 2);
      const head = -BAND + eased * (1 + BAND * 2); // band centre along the diagonal, 0..1
      px.fill(0);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const d = (x / cols + y / rows) / 2 - head;
          if (d > BAND || d < -BAND) continue;
          // Brightest just ahead of the centre, thinning out behind it.
          const v = d >= 0 ? 1 - d / BAND : 1 + d / BAND;
          const threshold = BAYER[((y & 3) << 2) | (x & 3)];
          if (v * 1.15 < threshold) continue;
          px[y * cols + x] = ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))];
        }
      }
      ctx.putImageData(image, 0, 0);
      if (k < 1) raf = requestAnimationFrame(frame);
      else canvas.style.opacity = "0";
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [theme]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pixelated pointer-events-none fixed left-0 top-0 z-[70] block transition-opacity duration-200"
    />
  );
}

/** Small note at the bottom: the theme's colours and its name. Rises in, then fades away. */
function ThemeNote({ theme, onDone }: { theme: ThemeName; onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const t = THEMES[theme];

  useEffect(() => {
    const hide = window.setTimeout(() => setLeaving(true), 1700);
    const done = window.setTimeout(onDone, 2000);
    return () => {
      window.clearTimeout(hide);
      window.clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <p
        role="status"
        className={cn(
          "glass px-frame px-sm flex h-10 items-center gap-3 pl-3 pr-4 text-[13.5px] text-ink-2 transition-[opacity,transform] duration-300 ease-soft [--frame:var(--color-line-2)]",
          leaving ? "translate-y-2 opacity-0" : "fade-in",
        )}
      >
        <span aria-hidden className="flex">
          {[t.scene[3], t.scene[4], t.scene[5], t.scene[8]].map((c) => (
            <span key={c} className="block size-3" style={{ backgroundColor: c }} />
          ))}
        </span>
        <span>
          <span className="font-medium text-ink">{t.label}</span> theme
        </span>
      </p>
    </div>
  );
}

/** Four tiny swatches in the footer. The quiet way in, for anyone who doesn't know the code. */
export function ThemeSwatches() {
  const name = useThemeName();
  return (
    <div role="radiogroup" aria-label="Colour theme" className="flex items-center gap-1.5">
      {THEME_ORDER.map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={name === t}
          aria-label={THEMES[t].label}
          title={THEMES[t].label}
          onClick={() => setTheme(t)}
          className="grid size-5 place-items-center"
        >
          <span
            className={cn(
              "block transition-[width,height] duration-200",
              name === t ? "size-[9px]" : "size-[5px] opacity-60 hover:size-[7px] hover:opacity-100",
            )}
            // The outline keeps light swatches (Paper) visible on light backgrounds too.
            style={{ backgroundColor: THEMES[t].swatch, boxShadow: "0 0 0 1px var(--color-line-2)" }}
          />
        </button>
      ))}
    </div>
  );
}
