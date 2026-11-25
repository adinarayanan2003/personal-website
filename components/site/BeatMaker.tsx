"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import {
  BPM_MAX,
  BPM_MIN,
  currentStep,
  decodePattern,
  DEFAULT_PATTERN,
  emptyPattern,
  encodePattern,
  getMode,
  isOn,
  playPattern,
  randomPattern,
  stop,
  subscribe,
  TRACKS,
  updatePattern,
  type Pattern,
} from "@/lib/dj";
import { cn } from "@/lib/utils";

const HASH_KEY = "beat=";

const usePatternPlaying = () => useSyncExternalStore(subscribe, () => isOn() && getMode() === "pattern", () => false);

function readHash(): Pattern | null {
  const h = window.location.hash.slice(1);
  return h.startsWith(HASH_KEY) ? decodePattern(h.slice(HASH_KEY.length)) : null;
}

function clearHash() {
  if (window.location.hash.startsWith(`#${HASH_KEY}`)) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

/**
 * A 16-step, five-track sequencer on top of the DJ engine. Patterns live in the URL
 * (#beat=...), so "Copy link" shares exactly what you made, and opening that link brings
 * up the beat-maker with the pattern loaded (press play: browsers won't autoplay sound).
 */
export function BeatMakerButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [initial, setInitial] = useState<Pattern | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // A shared link opens the beat-maker straight away.
  useEffect(() => {
    const fromLink = readHash();
    if (fromLink) {
      setInitial(fromLink);
      setOpen(true);
    }
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    clearHash();
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <button ref={buttonRef} type="button" onClick={() => setOpen(true)} className={cn("text-link text-[14px]", className)}>
        <svg viewBox="0 0 8 8" aria-hidden className="size-2.5" shapeRendering="crispEdges" fill="currentColor">
          <path d="M0 0h2v2H0zM3 0h2v2H3zM6 0h2v2H6zM0 3h2v2H0zM6 3h2v2H6zM3 6h2v2H3z" />
        </svg>
        Make a beat
      </button>
      {open ? createPortal(<BeatMakerWindow initial={initial ?? DEFAULT_PATTERN} onClose={close} />, document.body) : null}
    </>
  );
}

function BeatMakerWindow({ initial, onClose }: { initial: Pattern; onClose: () => void }) {
  const [pat, setPat] = useState<Pattern>(initial);
  const [copied, setCopied] = useState(false);
  const [playhead, setPlayhead] = useState(-1);
  const playing = usePatternPlaying();
  const windowRef = useRef<HTMLDivElement>(null);

  // Keep the engine in sync with every edit while it plays.
  useEffect(() => {
    updatePattern(pat);
  }, [pat]);

  // Playhead, read from the audio clock so it never drifts from what you hear.
  useEffect(() => {
    if (!playing) {
      setPlayhead(-1);
      return;
    }
    let raf = 0;
    const loop = () => {
      setPlayhead(currentStep());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  useEffect(() => {
    windowRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    // Capture phase, so Escape closes this window before DJ mode's own handler stops the music.
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [onClose]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  const toggleCell = (t: number, s: number) =>
    setPat((p) => ({ ...p, steps: p.steps.map((r, ti) => (ti === t ? r.map((v, si) => (si === s ? !v : v)) : r)) }));

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${HASH_KEY}${encodePattern(pat)}`;
    history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // The link is in the address bar now, ready to copy by hand.
      setCopied(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-3 sm:p-6">
      <div aria-hidden className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={windowRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="beat-title"
        tabIndex={-1}
        className="fade-in px-frame px-lg relative w-full max-w-[720px] bg-panel p-4 outline-none [--frame:var(--color-line-2)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="beat-title" className="text-[22px] font-semibold tracking-[-0.02em] text-ink">
              Make a beat
            </h2>
            <p className="mt-1 text-[14px] leading-relaxed text-muted">
              Tap the grid to place sounds. Copy the link to send someone exactly what you made.
            </p>
          </div>
          <button type="button" onClick={onClose} className="label px-1 py-1 text-[11px] hover:text-ink" aria-label="Close">
            Close
          </button>
        </div>

        <div className="mt-6 grid grid-cols-[44px_minmax(0,1fr)] items-center gap-x-2 gap-y-1.5 sm:grid-cols-[56px_minmax(0,1fr)] sm:gap-x-3">
          {TRACKS.map((track, t) => (
            <div key={track} className="contents">
              <p className="label text-[10px] sm:text-[11px]">{track}</p>
              <div className="grid grid-cols-16 gap-[3px] sm:gap-1">
                {pat.steps[t].map((on, s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    aria-label={`${track}, step ${s + 1}`}
                    onClick={() => toggleCell(t, s)}
                    className={cn(
                      "aspect-square w-full transition-colors duration-100",
                      on
                        ? t === 3 || t === 4
                          ? "bg-warm"
                          : "bg-accent"
                        : s % 4 === 0
                          ? "bg-line-2 hover:bg-faint"
                          : "bg-line hover:bg-faint",
                      playhead === s && (on ? "brightness-150" : "bg-ink-2/40"),
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            onClick={() => (playing ? stop() : void playPattern(pat))}
            className="px-frame px-sm inline-flex h-10 items-center gap-2 bg-ink px-4 text-[14px] font-medium text-bg [--frame:transparent] hover:bg-white"
          >
            {playing ? "Stop" : "Play"}
          </button>

          <label className="flex items-center gap-3 font-mono text-[12px] text-muted">
            <span className="w-[54px] tabular-nums text-ink-2">{pat.bpm} BPM</span>
            <input
              type="range"
              min={BPM_MIN}
              max={BPM_MAX}
              value={pat.bpm}
              onChange={(e) => setPat((p) => ({ ...p, bpm: Number(e.target.value) }))}
              className="w-28 accent-[var(--color-accent)]"
              aria-label="Tempo"
            />
          </label>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13.5px] text-muted sm:ml-auto">
            <button type="button" onClick={() => setPat((p) => randomPattern(p.bpm))} className="hover:text-ink">
              Surprise me
            </button>
            <button type="button" onClick={() => setPat((p) => emptyPattern(p.bpm))} className="hover:text-ink">
              Clear
            </button>
            <button type="button" onClick={copyLink} className="text-link text-[13.5px]">
              {copied ? "Link copied" : "Copy link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
