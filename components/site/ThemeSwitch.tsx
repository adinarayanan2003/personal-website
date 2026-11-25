"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { cycleTheme, getTheme, setTheme, subscribeTheme, THEME_ORDER, THEMES, type ThemeName } from "@/lib/theme";
import { cn } from "@/lib/utils";

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

export function useThemeName(): ThemeName {
  return useSyncExternalStore(subscribeTheme, getTheme, () => "pixel");
}

/**
 * The Konami code (↑ ↑ ↓ ↓ ← → ← → B A) swaps to the next cartridge. A small toast names
 * the theme each time it changes, wherever the change came from.
 */
export function ThemeKeys() {
  const name = useThemeName();
  const [toast, setToast] = useState<string | null>(null);
  const first = useRef(true);

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

  useEffect(() => {
    // No toast for the theme restored on load, only for changes.
    if (first.current) {
      first.current = false;
      return;
    }
    setToast(THEMES[name].label);
    const id = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(id);
  }, [name]);

  if (!toast) return null;
  return (
    <div className="fade-in pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-4">
      <p
        role="status"
        className="glass px-frame px-sm flex h-9 items-center gap-2.5 px-4 font-mono text-[11.5px] uppercase tracking-[0.1em] text-ink-2 [--frame:var(--color-line-2)]"
      >
        <span aria-hidden className="block size-[7px] bg-accent" />
        Cartridge: <span className="text-ink">{toast}</span>
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
            style={{ backgroundColor: THEMES[t].swatch }}
          />
        </button>
      ))}
    </div>
  );
}
