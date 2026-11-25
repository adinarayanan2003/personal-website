/**
 * Hidden colour themes ("cartridges"). Every pixel on the site comes from one of these
 * palettes, so swapping the theme recolours the canvases, the CSS and the DJ spectrum at once.
 *
 * This file is the single source for every theme: the CSS colour tokens (emitted as
 * :root[data-theme="..."] rules by themeCss(), see layout.tsx), the canvas palettes, and a
 * tiny store so canvases can redraw when the theme changes.
 *
 * Readability rules, checked for every theme: body text at least 12:1 against the
 * background, muted text 4.5:1 on any surface, the faintest labels 3:1, and text colours
 * kept close to neutral (low OKLCH chroma) so they stand apart from the coloured artwork.
 */

import { hexToRGBA32 } from "@/lib/pixel";

export type ThemeName = "pixel" | "paper" | "blueprint" | "synthwave" | "dusk" | "gameboy" | "amber" | "cga";

const CSS_TOKENS = ["bg", "panel", "raise", "ink", "ink-2", "muted", "faint", "line", "line-2", "accent", "accent-hi", "accent-dim", "warm", "warm-dim"] as const;

type Theme = {
  label: string;
  /** Tells the browser which way form controls and scrollbars should lean. */
  scheme: "dark" | "light";
  /** Values for the --color-* tokens Tailwind reads. */
  css: Record<(typeof CSS_TOKENS)[number], string>;
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
    scheme: "dark",
    css: {
      "bg": "#141414",
      "panel": "#1b1b1a",
      "raise": "#212120",
      "ink": "#f4efe7",
      "ink-2": "#cdc6ba",
      "muted": "#969088",
      "faint": "#6f6a64",
      "line": "rgb(244 239 231 / 0.09)",
      "line-2": "rgb(244 239 231 / 0.16)",
      "accent": "#2fc9cf",
      "accent-hi": "#7ff3f6",
      "accent-dim": "#0f6d72",
      "warm": "#f2a068",
      "warm-dim": "#b8653a",
    },
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
  paper: {
    label: "Paper",
    scheme: "light",
    css: {
      "bg": "#f3eee4",
      "panel": "#ebe5d8",
      "raise": "#e2dbcc",
      "ink": "#1c1a17",
      "ink-2": "#3a3631",
      "muted": "#625c52",
      "faint": "#857e72",
      "line": "rgb(28 26 23 / 0.11)",
      "line-2": "rgb(28 26 23 / 0.2)",
      "accent": "#0b6f73",
      "accent-hi": "#05484b",
      "accent-dim": "#a9d3cf",
      "warm": "#a5431a",
      "warm-dim": "#e7b597",
    },
    scene: [
      "#000000", "#e0d9ca",
      "#d3e5e1", "#6fb0aa", "#17797b", "#05484b",
      "#f0d4c2", "#d98e60", "#a5431a",
      "#ddd5c5", "#a0978a", "#6f685e",
      "#1c1a17",
    ],
    field: ["#e1e6dc", "#cddfd8", "#b4d3cb"],
    warmField: ["#efdccc", "#e8c8b0", "#ddae8c"],
    neutralField: ["#e7e1d5", "#ddd6c8", "#cfc7b7"],
    spectrum: ["#6fb0aa", "#6fb0aa", "#17797b", "#17797b", "#05484b", "#d98e60", "#a5431a"],
    spectrumBase: "#ddd5c5",
    redact: ["#cfc7b8", "#c3baaa", "#d8d0c1", "#bdb4a4"],
    swatch: "#e6dccb",
  },
  blueprint: {
    label: "Blueprint",
    scheme: "dark",
    css: {
      "bg": "#0c2847",
      "panel": "#103058",
      "raise": "#143762",
      "ink": "#f2f7ff",
      "ink-2": "#cad9ee",
      "muted": "#93abcc",
      "faint": "#6c87ad",
      "line": "rgb(242 247 255 / 0.11)",
      "line-2": "rgb(242 247 255 / 0.2)",
      "accent": "#7fd1ff",
      "accent-hi": "#c6ecff",
      "accent-dim": "#2e6aa8",
      "warm": "#ffd166",
      "warm-dim": "#c08a2a",
    },
    scene: [
      "#000000", "#163b66",
      "#1b4675", "#2f6fb0", "#6fbdf2", "#dff3ff",
      "#4a3f2a", "#c99a3a", "#ffd166",
      "#173c68", "#3f679e", "#93abcc",
      "#f2f7ff",
    ],
    field: ["#143a66", "#1d4f88", "#2b68a8"],
    warmField: ["#3a3423", "#6a5626", "#9c7a2c"],
    neutralField: ["#13355e", "#1a416f", "#244e82"],
    spectrum: ["#2f6fb0", "#2f6fb0", "#6fbdf2", "#6fbdf2", "#dff3ff", "#c99a3a", "#ffd166"],
    spectrumBase: "#163b66",
    redact: ["#2a4d7a", "#33578a", "#244570", "#3a6094"],
    swatch: "#4f9fe0",
  },
  synthwave: {
    label: "Synthwave",
    scheme: "dark",
    css: {
      "bg": "#150e24",
      "panel": "#1c1430",
      "raise": "#24193c",
      "ink": "#fbf2ff",
      "ink-2": "#dccfe6",
      "muted": "#a698b6",
      "faint": "#7b6a92",
      "line": "rgb(251 242 255 / 0.1)",
      "line-2": "rgb(251 242 255 / 0.18)",
      "accent": "#ff6eb4",
      "accent-hi": "#ffb8dd",
      "accent-dim": "#8a2a63",
      "warm": "#ffc857",
      "warm-dim": "#b9862a",
    },
    scene: [
      "#000000", "#241a3a",
      "#3a1f4f", "#8a2a7a", "#ff6eb4", "#ffd6ee",
      "#4a2a1a", "#d9853a", "#ffc857",
      "#291e40", "#56457c", "#a698b6",
      "#fbf2ff",
    ],
    field: ["#2a1742", "#4f1d62", "#86297c"],
    warmField: ["#3a2216", "#6a3d1c", "#a86a26"],
    neutralField: ["#211835", "#2b2043", "#382b54"],
    spectrum: ["#8a2a7a", "#8a2a7a", "#ff6eb4", "#ff6eb4", "#ffd6ee", "#d9853a", "#ffc857"],
    spectrumBase: "#241a3a",
    redact: ["#3d2f57", "#4a3a67", "#33274b", "#45365f"],
    swatch: "#ff6eb4",
  },
  dusk: {
    label: "Dusk",
    scheme: "dark",
    css: {
      "bg": "#1b1412",
      "panel": "#231a17",
      "raise": "#2c211d",
      "ink": "#fbefe6",
      "ink-2": "#e3d0c3",
      "muted": "#b39b8b",
      "faint": "#86705f",
      "line": "rgb(251 239 230 / 0.1)",
      "line-2": "rgb(251 239 230 / 0.17)",
      "accent": "#ff8f6b",
      "accent-hi": "#ffc9b6",
      "accent-dim": "#8f4630",
      "warm": "#a9d6a3",
      "warm-dim": "#5f8a5a",
    },
    scene: [
      "#000000", "#2c221e",
      "#3f241b", "#9a4a32", "#ff8f6b", "#ffdccf",
      "#26361f", "#5f8a5a", "#a9d6a3",
      "#30251f", "#584740", "#b39b8b",
      "#fbefe6",
    ],
    field: ["#33201a", "#5e2e22", "#94442f"],
    warmField: ["#22301c", "#36502c", "#4f7442"],
    neutralField: ["#29201c", "#342925", "#433530"],
    spectrum: ["#9a4a32", "#9a4a32", "#ff8f6b", "#ff8f6b", "#ffdccf", "#5f8a5a", "#a9d6a3"],
    spectrumBase: "#2c221e",
    redact: ["#46372f", "#53423a", "#3c2f28", "#4d3d35"],
    swatch: "#ff8f6b",
  },
  gameboy: {
    label: "Game Boy",
    scheme: "dark",
    css: {
      "bg": "#0c1d0e",
      "panel": "#112614",
      "raise": "#173019",
      "ink": "#f2f6e2",
      "ink-2": "#d6dec4",
      "muted": "#a3ae92",
      "faint": "#74835f",
      "line": "rgb(242 246 226 / 0.1)",
      "line-2": "rgb(242 246 226 / 0.18)",
      "accent": "#a6d93a",
      "accent-hi": "#d8f27e",
      "accent-dim": "#3b6b22",
      "warm": "#e4ef6a",
      "warm-dim": "#8a9a2a",
    },
    scene: [
      "#000000", "#183219",
      "#1f4721", "#3b6b22", "#8bc21c", "#d8f27e",
      "#3a4a12", "#8a9a2a", "#e4ef6a",
      "#183019", "#365b37", "#a3ae92",
      "#f2f6e2",
    ],
    field: ["#163819", "#225224", "#33702a"],
    warmField: ["#2c3a10", "#4a5a18", "#6c7c22"],
    neutralField: ["#13291a", "#1a3420", "#25432a"],
    spectrum: ["#3b6b22", "#3b6b22", "#8bc21c", "#8bc21c", "#d8f27e", "#8a9a2a", "#e4ef6a"],
    spectrumBase: "#183219",
    redact: ["#2a4a2b", "#335834", "#244026", "#3b623c"],
    swatch: "#8bc21c",
  },
  amber: {
    label: "Amber terminal",
    scheme: "dark",
    css: {
      "bg": "#120c05",
      "panel": "#1a1208",
      "raise": "#23190c",
      "ink": "#fff4e2",
      "ink-2": "#ecd8ba",
      "muted": "#b99f7d",
      "faint": "#86704f",
      "line": "rgb(255 244 226 / 0.1)",
      "line-2": "rgb(255 244 226 / 0.18)",
      "accent": "#ffb000",
      "accent-hi": "#ffd37a",
      "accent-dim": "#7a5208",
      "warm": "#ff8a4a",
      "warm-dim": "#a8461a",
    },
    scene: [
      "#000000", "#241a0d",
      "#3a2909", "#7a5208", "#e09a12", "#ffd37a",
      "#3a1a08", "#b0501a", "#ff8a4a",
      "#271c0e", "#5a462a", "#b99f7d",
      "#fff4e2",
    ],
    field: ["#2a1d07", "#4c3408", "#76520b"],
    warmField: ["#2e1608", "#55290f", "#874018"],
    neutralField: ["#211a10", "#2c2216", "#3a2e1e"],
    spectrum: ["#7a5208", "#7a5208", "#e09a12", "#e09a12", "#ffd37a", "#b0501a", "#ff8a4a"],
    spectrumBase: "#241a0d",
    redact: ["#3f3220", "#4c3d28", "#36291a", "#46382a"],
    swatch: "#ffb000",
  },
  cga: {
    label: "CGA",
    scheme: "dark",
    css: {
      "bg": "#000000",
      "panel": "#0a0a0a",
      "raise": "#151515",
      "ink": "#ffffff",
      "ink-2": "#d8d8d8",
      "muted": "#aaaaaa",
      "faint": "#757575",
      "line": "rgb(255 255 255 / 0.12)",
      "line-2": "rgb(255 255 255 / 0.22)",
      "accent": "#55ffff",
      "accent-hi": "#aaffff",
      "accent-dim": "#00aaaa",
      "warm": "#ff55ff",
      "warm-dim": "#aa00aa",
    },
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

export const THEME_ORDER: ThemeName[] = ["pixel", "paper", "blueprint", "synthwave", "dusk", "gameboy", "amber", "cga"];
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

/** CSS for every non-default theme. Pixel's values are the defaults in globals.css. */
export function themeCss() {
  return THEME_ORDER.filter((n) => n !== "pixel")
    .map((n) => {
      const t = THEMES[n];
      const vars = CSS_TOKENS.map((k) => `--color-${k}:${t.css[k]}`).join(";");
      return `:root[data-theme="${n}"]{${vars};color-scheme:${t.scheme}}`;
    })
    .join("\n");
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
