/**
 * Hidden colour themes ("cartridges"). Every pixel on the site comes from one of these
 * palettes, so swapping the theme recolours the canvases, the CSS and the DJ spectrum at once.
 *
 * The CSS side lives in globals.css under :root[data-theme="..."]. This file holds the
 * canvas side, plus a tiny store so canvases can redraw when the theme changes.
 */

import { hexToRGBA32 } from "@/lib/pixel";

export type ThemeName = "pixel" | "gameboy" | "amber" | "cga";

type Theme = {
  label: string;
  /**
   * Scene palette, indexed like `C` in lib/scenes/engine.ts:
   * [unused, GRID, T1, T2, T3, T4, W1, W2, W3, N1, N2, N3, INK].
   */
  scene: readonly string[];
  /** Ambient field levels 1..3 for the hero and contact panels. */
  field: readonly string[];
  /** Fields for the eras map while scrubbing, per era tone. */
  warmField: readonly string[];
  neutralField: readonly string[];
  /** DJ spectrum rows, bottom to top, plus the dim baseline. */
  spectrum: readonly string[];
  spectrumBase: string;
  /** Marker shades for redacted text. */
  redact: readonly string[];
  /** One colour that stands for the theme on the footer switch. */
  swatch: string;
};

export const THEMES: Record<ThemeName, Theme> = {
  pixel: {
    label: "Pixel",
    scene: [
      "#000000", "#232625",
      "#15383a", "#0e6c72", "#1eaab1", "#7ff3f6",
      "#46271a", "#b8653a", "#f2a068",
      "#2e2e2c", "#4f4c48", "#8f8a82",
      "#f4efe7",
    ],
    field: ["#15383a", "#0e6c72", "#1eaab1"],
    warmField: ["#2e1a11", "#5a2f1a", "#94522e"],
    neutralField: ["#222221", "#302f2d", "#45433f"],
    spectrum: ["#0e6c72", "#0e6c72", "#1eaab1", "#1eaab1", "#7ff3f6", "#b8653a", "#f2a068"],
    spectrumBase: "#232625",
    redact: ["#3d3b38", "#4f4c48", "#34332f", "#46433f"],
    swatch: "#2fc9cf",
  },
  gameboy: {
    label: "Game Boy",
    scene: [
      "#000000", "#163416",
      "#1e4a1e", "#306230", "#8bac0f", "#c8e85a",
      "#2a4a12", "#6f8f2a", "#b8d838",
      "#183818", "#2f5a2f", "#6f8f4a",
      "#d4ec7a",
    ],
    field: ["#1a3f1a", "#306230", "#6f8f2a"],
    warmField: ["#24400f", "#4a6a1a", "#7a9a28"],
    neutralField: ["#132a13", "#1e3d1e", "#2f5a2f"],
    spectrum: ["#306230", "#306230", "#6f8f2a", "#8bac0f", "#8bac0f", "#b8d838", "#d4ec7a"],
    spectrumBase: "#163416",
    redact: ["#2f5a2f", "#3d6b2a", "#264d26", "#356335"],
    swatch: "#8bac0f",
  },
  amber: {
    label: "Amber terminal",
    scene: [
      "#000000", "#20180a",
      "#3a2808", "#7a5208", "#c88a10", "#ffd060",
      "#3a1a06", "#a04a10", "#ff7a1a",
      "#241a0a", "#4a3814", "#8a6a30",
      "#ffcf70",
    ],
    field: ["#2e2007", "#5e3f08", "#9a6a0c"],
    warmField: ["#2e1406", "#5e2a0c", "#8f4212"],
    neutralField: ["#1e1608", "#2c210c", "#3e2f12"],
    spectrum: ["#7a5208", "#7a5208", "#c88a10", "#c88a10", "#ffd060", "#a04a10", "#ff7a1a"],
    spectrumBase: "#20180a",
    redact: ["#4a3814", "#5a4418", "#3e2f12", "#524016"],
    swatch: "#ffb000",
  },
  cga: {
    label: "CGA",
    scene: [
      "#000000", "#141414",
      "#0a3a3a", "#00aaaa", "#55ffff", "#ffffff",
      "#3a0a3a", "#aa00aa", "#ff55ff",
      "#1a1a1a", "#555555", "#aaaaaa",
      "#ffffff",
    ],
    field: ["#0a2e2e", "#006e6e", "#00aaaa"],
    warmField: ["#2e0a2e", "#6e006e", "#aa00aa"],
    neutralField: ["#121212", "#262626", "#3a3a3a"],
    spectrum: ["#00aaaa", "#00aaaa", "#55ffff", "#55ffff", "#ffffff", "#aa00aa", "#ff55ff"],
    spectrumBase: "#141414",
    redact: ["#555555", "#3a3a3a", "#4a4a4a", "#2e2e2e"],
    swatch: "#ff55ff",
  },
};

export const THEME_ORDER: ThemeName[] = ["pixel", "gameboy", "amber", "cga"];
const STORAGE_KEY = "theme";

let current: ThemeName | null = null;
const listeners = new Set<() => void>();

/** The active theme. Read from <html data-theme> on first use (set before paint by layout.tsx). */
export function getTheme(): ThemeName {
  if (current) return current;
  if (typeof document === "undefined") return "pixel";
  const t = document.documentElement.dataset.theme as ThemeName | undefined;
  current = t && t in THEMES ? t : "pixel";
  return current;
}

export const theme = () => THEMES[getTheme()];

export function setTheme(name: ThemeName) {
  current = name;
  const root = document.documentElement;
  if (name === "pixel") delete root.dataset.theme;
  else root.dataset.theme = name;
  try {
    if (name === "pixel") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, name);
  } catch {
    // Private mode or blocked storage: the theme just won't persist.
  }
  listeners.forEach((fn) => fn());
}

export function cycleTheme() {
  const i = THEME_ORDER.indexOf(getTheme());
  setTheme(THEME_ORDER[(i + 1) % THEME_ORDER.length]);
}

export function subscribeTheme(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Inline script for <head>: applies a saved theme before first paint, so there's no flash. */
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t&&t!=="pixel")document.documentElement.dataset.theme=t}catch(e){}`;

const lutCache = new Map<ThemeName, Uint32Array>();

/** Scene palette as RGBA words for ImageData, index 0 transparent. Cached per theme. */
export function sceneLUT(): Uint32Array {
  const name = getTheme();
  let lut = lutCache.get(name);
  if (!lut) {
    lut = new Uint32Array(THEMES[name].scene.map((hex, i) => (i === 0 ? 0 : hexToRGBA32(hex))));
    lutCache.set(name, lut);
  }
  return lut;
}
