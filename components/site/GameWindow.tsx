"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { GAMES, type GameName } from "@/lib/games";
import type { Game } from "@/lib/games/types";
import { Gfx, type Pointer } from "@/lib/scenes/engine";
import { sceneLUT, subscribeTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const FPS = 30;
const SCROLL_KEYS = new Set([" ", "Spacebar", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
const FOCUSABLE = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

type Phase = "ready" | "playing" | "done";

const bestKey = (game: GameName) => `game-best:${game}`;

function readBest(game: GameName) {
  try {
    return Number(localStorage.getItem(bestKey(game))) || 0;
  } catch {
    return 0;
  }
}

function writeBest(game: GameName, score: number) {
  try {
    localStorage.setItem(bestKey(game), String(score));
  } catch {
    // Private mode or blocked storage: the best score just won't stick.
  }
}

/** "Play it" link that opens a project's mini-game in a window. */
export function PlayButton({ game, className }: { game: GameName; className?: string }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={cn("text-link text-[14px]", className)}
      >
        <svg viewBox="0 0 8 8" aria-hidden className="size-2.5" shapeRendering="crispEdges" fill="currentColor">
          <path d="M1 0h2v1H1zM1 1h3v1H1zM1 2h4v1H1zM1 3h5v2H1zM1 5h4v1H1zM1 6h3v1H1zM1 7h2v1H1z" />
        </svg>
        Play it
      </button>
      {open ? createPortal(<GameWindow game={game} onClose={close} />, document.body) : null}
    </>
  );
}

/** Modal with a pixel canvas, a start screen, a 30 second round and a results screen. */
export function GameWindow({ game, onClose }: { game: GameName; onClose: () => void }) {
  const def = GAMES[game];
  const titleId = useId();
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(def.seconds);
  const [best, setBest] = useState(0);
  const [result, setResult] = useState<{ score: number; newBest: boolean } | null>(null);

  const windowRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const againRef = useRef<HTMLButtonElement>(null);
  const phaseRef = useRef<Phase>("ready");
  const startRef = useRef<() => void>(() => {});
  const keysRef = useRef<string[]>([]);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setBest(readBest(game));
  }, [game]);

  // Canvas, game loop and pointer input.
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const g = new Gfx();
    let image: ImageData | null = null;
    let pixels: Uint32Array | null = null;
    let cssCell = 4;
    let run: Game = def.create(1);
    let t = 0;
    let last = 0;
    let lastStep = 0;
    let raf = 0;
    let pointer: Pointer = null;
    let clicks: { x: number; y: number }[] = [];
    let shownScore = -1;
    let shownLeft = -1;

    const paint = () => {
      if (!image || !pixels) return;
      const lut = sceneLUT();
      const buf = g.buf;
      for (let i = 0; i < buf.length; i++) pixels[i] = lut[buf[i]];
      ctx.putImageData(image, 0, 0);
    };

    /** Draw the current state again without moving time or feeding input. */
    const redraw = () => {
      if (!g.cols) return;
      g.clear();
      run.step({ g, t, dt: 0, pointer: null, clicks: [], keys: [] });
      paint();
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = window.devicePixelRatio || 1;
      // About 160 columns on a wide window, but never so small the 3x5 font stops reading.
      const target = Math.max(2, Math.min(5, Math.max(rect.width / 160, Math.min(3, rect.width / 100))));
      cssCell = Math.max(2, Math.round(target * dpr)) / dpr;
      const cols = Math.max(60, Math.floor(rect.width / cssCell));
      const rows = Math.max(40, Math.floor(rect.height / cssCell));
      canvas.style.width = `${cols * cssCell}px`;
      canvas.style.height = `${rows * cssCell}px`;
      if (cols === g.cols && rows === g.rows) return;
      g.resize(cols, rows);
      canvas.width = cols;
      canvas.height = rows;
      image = ctx.createImageData(cols, rows);
      pixels = new Uint32Array(image.data.buffer);
      redraw();
    };

    const finish = () => {
      phaseRef.current = "done";
      const final = run.score();
      const prev = readBest(game);
      const newBest = final > prev;
      if (newBest) writeBest(game, final);
      setBest(Math.max(prev, final));
      setScore(final);
      setResult({ score: final, newBest });
      setPhase("done");
    };

    const frame = (now: number) => {
      raf = 0;
      if (phaseRef.current !== "playing" || document.visibilityState !== "visible") return;
      raf = requestAnimationFrame(frame);
      if (now - lastStep < 1000 / FPS - 4) return;
      lastStep = now;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t = Math.min(def.seconds, t + dt);
      g.clear();
      const keys = keysRef.current;
      keysRef.current = [];
      run.step({ g, t, dt, pointer, clicks, keys });
      clicks = [];
      paint();

      const s = run.score();
      if (s !== shownScore) setScore((shownScore = s));
      const l = Math.max(0, Math.ceil(def.seconds - t));
      if (l !== shownLeft) setLeft((shownLeft = l));
      if (t >= def.seconds || run.over()) {
        cancelAnimationFrame(raf);
        raf = 0;
        finish();
      }
    };

    const play = () => {
      if (raf || phaseRef.current !== "playing") return;
      last = lastStep = performance.now();
      raf = requestAnimationFrame(frame);
    };

    startRef.current = () => {
      run = def.create((Math.random() * 2 ** 31) >>> 0);
      t = 0;
      clicks = [];
      keysRef.current = [];
      shownScore = shownLeft = -1;
      phaseRef.current = "playing";
      setResult(null);
      setScore(0);
      setLeft(def.seconds);
      setPhase("playing");
      redraw();
      windowRef.current?.focus({ preventScroll: true });
      play();
    };

    const toCells = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / cssCell, y: (e.clientY - r.top) / cssCell };
    };
    const onDown = (e: PointerEvent) => {
      if (phaseRef.current !== "playing") return;
      e.preventDefault();
      const p = toCells(e);
      clicks.push(p);
      pointer = e.pointerType === "touch" ? null : p;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "touch") pointer = toCells(e);
    };
    const onLeave = () => {
      pointer = null;
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") play();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const unsubTheme = subscribeTheme(paint);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    resize();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      phaseRef.current = "done";
      ro.disconnect();
      unsubTheme();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [def, game]);

  // Focus, scroll lock and keys, only while the window is open.
  useEffect(() => {
    const win = windowRef.current;
    win?.focus({ preventScroll: true });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Capture phase plus stopPropagation: Escape closes the game, not DJ mode.
        e.stopPropagation();
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key === "Tab" && win) {
        const items = Array.from(win.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!items.length) return;
        const first = items[0];
        const lastItem = items[items.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === win)) {
          e.preventDefault();
          lastItem.focus();
        } else if (!e.shiftKey && active === lastItem) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      const target = e.target as HTMLElement | null;
      const onButton = !!target?.closest("button");
      const playing = phaseRef.current === "playing";
      // Keep the page from scrolling. Arrows still reach other listeners (no stopPropagation).
      if (SCROLL_KEYS.has(e.key) && (playing || !onButton)) e.preventDefault();
      if (playing) {
        if (!e.repeat && !e.metaKey && !e.ctrlKey && !e.altKey) keysRef.current.push(e.key);
      } else if (phaseRef.current === "ready" && !onButton && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        startRef.current();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey, true);
    };
  }, []);

  useEffect(() => {
    if (phase === "done") againRef.current?.focus({ preventScroll: true });
  }, [phase]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-3 sm:p-6">
      <div aria-hidden className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={windowRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="fade-in px-frame px-lg relative max-h-[calc(100dvh-24px)] w-full max-w-[720px] overflow-y-auto bg-panel p-4 outline-none [--frame:var(--color-line-2)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label text-[10.5px] text-faint">Mini-game</p>
            <h2 id={titleId} className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-ink">
              {def.title}
            </h2>
            <p className="mt-1 text-[14px] leading-relaxed text-muted">{def.how}</p>
          </div>
          <button type="button" onClick={onClose} className="label shrink-0 px-1 py-1 text-[11px] hover:text-ink">
            Close
          </button>
        </div>

        <div
          ref={wrapRef}
          className="px-frame px-sm relative mt-5 grid aspect-[16/10] w-full place-items-center overflow-hidden bg-bg [--frame:var(--color-line)]"
        >
          <canvas ref={canvasRef} aria-hidden className="pixelated block touch-none select-none" />

          {phase === "ready" ? (
            <div className="absolute inset-0 grid place-items-center bg-bg/45">
              <button
                type="button"
                onClick={() => startRef.current()}
                className="px-frame px-sm inline-flex h-10 items-center gap-2 bg-ink px-5 text-[14px] font-medium text-bg [--frame:transparent] hover:bg-white"
              >
                <svg viewBox="0 0 8 8" aria-hidden className="size-2.5" shapeRendering="crispEdges" fill="currentColor">
                  <path d="M1 0h2v1H1zM1 1h3v1H1zM1 2h4v1H1zM1 3h5v2H1zM1 5h4v1H1zM1 6h3v1H1zM1 7h2v1H1z" />
                </svg>
                Start
              </button>
            </div>
          ) : null}

          {phase === "done" && result ? (
            <div className="absolute inset-0 grid place-items-center bg-bg/70 p-4 text-center">
              <div role="status">
                <p className="text-[24px] font-semibold tracking-[-0.02em] text-ink">Final score {result.score}</p>
                {result.newBest ? <p className="label mt-1 text-accent">New best!</p> : null}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    ref={againRef}
                    type="button"
                    onClick={() => startRef.current()}
                    className="px-frame px-sm inline-flex h-10 items-center bg-ink px-4 text-[14px] font-medium text-bg [--frame:transparent] hover:bg-white"
                  >
                    Play again
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-frame px-sm inline-flex h-10 items-center px-4 text-[14px] text-ink-2 [--frame:var(--color-line-2)] hover:text-ink"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-[12px] uppercase tracking-[0.1em] tabular-nums">
          <span className="text-faint">
            Score <span className="text-ink">{score}</span>
          </span>
          <span className="text-faint">
            Time <span className={cn(left <= 5 && phase === "playing" ? "text-warm" : "text-ink")}>{left}s</span>
          </span>
          <span className="text-faint">
            Best <span className="text-ink">{best}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
