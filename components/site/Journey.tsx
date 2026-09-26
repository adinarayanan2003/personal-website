"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { ArrowUpRight } from "@/components/ui/icons";
import type { JourneyEvent } from "@/lib/data";
import { hexToRGBA32 } from "@/lib/pixel";
import { C, PALETTE } from "@/lib/scenes/engine";
import { cn } from "@/lib/utils";

const LUT = new Uint32Array(PALETTE.map((hex, i) => (i === 0 ? 0 : hexToRGBA32(hex))));

/** Colors per line: [lit, unlit]. */
const MAIN = [C.T3, C.T1] as const;
const SIDE = [C.N3, C.N1] as const;
const FOUNDER = [C.W2, C.W1] as const;

type Layout = { cell: number; lane0: number; lane1: number; cols: number };

function layoutFor(desktop: boolean): Omit<Layout, "cell"> {
  return desktop ? { lane0: 2, lane1: 8, cols: 12 } : { lane0: 2, lane1: 7, cols: 10 };
}

/**
 * The path so far as a pixel git graph. The main line carries school, college and
 * Oracle; side branches hold the DAO and Owly. A HEAD line follows the scroll, lights
 * the path it has passed and brings each step into focus.
 */
export function Journey({ events }: { events: JourneyEvent[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reached, setReached] = useState<boolean[]>(() => events.map(() => true));
  const [ready, setReady] = useState(false);
  const [graphW, setGraphW] = useState(60);

  useEffect(() => {
    const list = listRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!list || !canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const months = (a: string, b: string) => {
      const [ay, am] = a.split("-").map(Number);
      const [by, bm] = b.split("-").map(Number);
      return (by - ay) * 12 + (bm - am);
    };

    let L: Layout = { cell: 4, ...layoutFor(true) };
    let rows = 0;
    let buf = new Uint8Array(0);
    let image: ImageData | null = null;
    let pixels: Uint32Array | null = null;
    let ys: number[] = [];
    let state = events.map(() => false);
    let raf = 0;
    let visible = false;

    const measure = () => {
      const dpr = window.devicePixelRatio || 1;
      const desktop = desktopQuery.matches;
      const target = desktop ? 5 : 3;
      L = { cell: Math.max(2, Math.round(target * dpr)) / dpr, ...layoutFor(desktop) };
      setGraphW(L.cols * L.cell);
      const box = list.getBoundingClientRect();
      rows = Math.max(1, Math.ceil(box.height / L.cell));
      canvas.width = L.cols;
      canvas.height = rows;
      canvas.style.width = `${L.cols * L.cell}px`;
      canvas.style.height = `${rows * L.cell}px`;
      buf = new Uint8Array(L.cols * rows);
      image = ctx.createImageData(L.cols, rows);
      pixels = new Uint32Array(image.data.buffer);
      ys = Array.from(list.querySelectorAll<HTMLElement>("[data-node]")).map((el) => {
        const r = el.getBoundingClientRect();
        return Math.round((r.top + r.height / 2 - box.top) / L.cell);
      });
    };

    const px = (x: number, y: number, c: number) => {
      if (x < 0 || y < 0 || x >= L.cols || y >= rows) return;
      buf[y * L.cols + x] = c;
    };

    const draw = () => {
      raf = 0;
      if (!image || !pixels || ys.length !== events.length) return;
      const box = list.getBoundingClientRect();
      const headLine = reduce ? Infinity : (window.innerHeight * 0.62 - box.top) / L.cell;
      const head = Math.min(headLine, ys[ys.length - 1] + 1);
      const lit = (y: number) => y <= head;

      // Where "today" falls on the graph, from the dates on either side of it.
      // Everything below it is still ahead, so it's drawn dashed.
      let past = -1;
      events.forEach((e, i) => {
        if (e.date && e.date <= thisMonth) past = i;
      });
      let todayY = Infinity;
      if (past >= 0 && past < events.length - 1) {
        const a = events[past];
        const b = events[past + 1];
        const span = b.date ? Math.max(1, months(a.date!, b.date)) : 0;
        const frac = b.date ? Math.min(1, Math.max(0, months(a.date!, thisMonth) / span)) : 0.35;
        todayY = ys[past] + frac * (ys[past + 1] - ys[past]);
      }
      const dashed = (y: number) => y <= todayY || Math.floor(y / 2) % 2 === 0;

      buf.fill(0);

      const vline = (x: number, y0: number, y1: number, colors: readonly [number, number]) => {
        for (let y = y0; y <= y1; y++) {
          if (!dashed(y)) continue;
          px(x, y, lit(y) ? colors[0] : colors[1]);
        }
      };
      // Pixel staircase from (x0, y0) to (x1, y0 + |x1 - x0|): one step across, one step down.
      const stairs = (x0: number, y0: number, x1: number, colors: readonly [number, number]) => {
        const dir = x1 > x0 ? 1 : -1;
        const n = Math.abs(x1 - x0);
        for (let i = 0; i <= n; i++) {
          const x = x0 + i * dir;
          const y = y0 + i;
          if (!dashed(y)) continue;
          const c = lit(y) ? colors[0] : colors[1];
          px(x, y, c);
          if (i < n) px(x + dir, y, c);
        }
      };

      const dx = L.lane1 - L.lane0;
      const handoff = events.findIndex((e) => e.handoff);
      const mainEnd = handoff >= 0 ? handoff : events.length - 1;

      // Main line.
      for (let i = 0; i < mainEnd; i++) {
        vline(L.lane0, ys[i], ys[i + 1], MAIN);
      }

      // Side branches.
      events.forEach((e, i) => {
        if (!e.branch) return;
        const colors = e.kind === "Founder" ? FOUNDER : SIDE;
        const endIdx = events.findIndex((f, j) => j > i && f.lane === 1 && (f.merge || j === events.length - 1));
        const end = endIdx >= 0 ? endIdx : events.length - 1;
        stairs(L.lane0, ys[i] - dx, L.lane1, colors);
        vline(L.lane1, ys[i], ys[end], colors);
        if (events[end].merge) stairs(L.lane1, ys[end], L.lane0, colors);
      });

      // The main line hands over to the founder branch.
      if (handoff >= 0) stairs(L.lane0, ys[handoff], L.lane1, FOUNDER);

      // Nodes. Upcoming steps stay hollow even after the scroll passes them.
      events.forEach((e, i) => {
        const x = e.lane === 0 ? L.lane0 : L.lane1;
        const y = ys[i];
        const colors = e.kind === "Founder" ? FOUNDER : e.lane === 1 ? SIDE : MAIN;
        const on = lit(y);
        const last = i === events.length - 1;
        const upcoming = !last && !!e.date && e.date > thisMonth;
        for (let yy = -1; yy <= 1; yy++) {
          for (let xx = -1; xx <= 1; xx++) {
            const edge = xx !== 0 || yy !== 0;
            if (!edge && (upcoming || !on)) px(x, y, C.NONE);
            else if (on) px(x + xx, y + yy, last ? C.W3 : colors[0]);
            else px(x + xx, y + yy, colors[1]);
          }
        }
        if (on && last) {
          px(x - 2, y, C.W2);
          px(x + 2, y, C.W2);
          px(x, y - 2, C.W2);
          px(x, y + 2, C.W2);
        }
        if (e.handoff) {
          // End cap on the main line.
          px(x - 2, y + 2, on ? MAIN[0] : MAIN[1]);
          px(x + 2, y + 2, on ? MAIN[0] : MAIN[1]);
        }
      });

      // HEAD: a short bright tick across whichever lines are active at this height.
      if (!reduce && headLine > ys[0] && headLine < ys[ys.length - 1]) {
        const y = Math.round(headLine);
        for (let x = 0; x < L.cols; x++) {
          const c = buf[y * L.cols + x];
          if (c !== C.NONE) px(x, y, C.INK);
        }
        px(0, y, C.N2);
      }

      const out = pixels;
      for (let i = 0; i < buf.length; i++) out[i] = LUT[buf[i]];
      ctx.putImageData(image, 0, 0);

      const next = ys.map((y) => y <= head + 1);
      if (next.some((v, i) => v !== state[i])) {
        state = next;
        setReached(next);
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const onScroll = () => {
      if (visible) schedule();
    };
    const relayout = () => {
      measure();
      schedule();
    };

    measure();
    draw();
    setReady(true);

    const resizeObserver = new ResizeObserver(relayout);
    resizeObserver.observe(list);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) schedule();
      },
      { rootMargin: "200px" },
    );
    io.observe(list);
    window.addEventListener("scroll", onScroll, { passive: true });
    desktopQuery.addEventListener("change", relayout);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      desktopQuery.removeEventListener("change", relayout);
    };
  }, [events]);

  // The latest step the scroll has reached gets a git-style "HEAD -> branch" decoration.
  const head = ready ? reached.lastIndexOf(true) : -1;
  const branchOf = (e: JourneyEvent) => (e.lane === 0 ? "main" : e.kind === "Founder" ? "owly" : "dao");

  return (
    <div className="relative mt-10 sm:mt-14" style={{ "--graph": `${graphW}px` } as CSSProperties}>
      <canvas ref={canvasRef} aria-hidden className="pixelated pointer-events-none absolute left-0 top-0" />
      <ol ref={listRef} className="relative">
        {events.map((e, i) => {
          const on = !ready || reached[i];
          const founder = e.kind === "Founder";
          const last = i === events.length - 1;
          return (
            <li
              key={`${e.when}-${e.title}`}
              className={cn(
                "grid grid-cols-[var(--graph)_minmax(0,1fr)] gap-x-4 py-4 transition-[opacity,transform] duration-500 ease-soft sm:py-5 md:grid-cols-[var(--graph)_112px_minmax(0,1fr)] md:gap-x-6 md:py-6",
                on ? "opacity-100" : "translate-x-1 opacity-35",
              )}
            >
              <span aria-hidden className="row-span-2 md:row-span-1" />
              <p className="col-start-2 flex items-baseline gap-2.5 font-mono text-[12.5px] uppercase tracking-[0.06em] md:flex-col md:gap-1 md:pt-[5px]">
                <span className={founder ? "text-warm" : "text-ink-2"}>{e.when}</span>
                <span className="text-[10.5px] tracking-[0.12em] text-faint">{e.kind}</span>
              </p>
              <div className="col-start-2 mt-1.5 md:col-start-3 md:row-start-1 md:mt-0">
                <h3
                  data-node
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[18px] font-semibold leading-snug tracking-[-0.015em] text-ink sm:text-[19px]"
                >
                  {e.href ? (
                    <a
                      href={e.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-1.5 hover:text-warm"
                    >
                      {e.title}
                      <ArrowUpRight className="size-3.5 text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  ) : (
                    e.title
                  )}
                  {last ? <span className="live-dot [--dot:var(--color-warm)]" aria-hidden /> : null}
                  {i === head ? (
                    <span
                      aria-hidden
                      className={cn(
                        "fade-in border px-1.5 py-px font-mono text-[10.5px] font-normal uppercase tracking-[0.1em]",
                        founder
                          ? "border-[rgb(242_160_104/0.45)] text-warm"
                          : "border-[rgb(47_201_207/0.4)] text-accent-hi",
                      )}
                    >
                      HEAD → {branchOf(e)}
                    </span>
                  ) : null}
                </h3>
                {e.detail ? (
                  <p className="mt-1.5 max-w-[640px] text-[15px] leading-relaxed text-muted">{e.detail}</p>
                ) : null}
                {e.outcomes ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {e.outcomes.map((o) => (
                      <span key={o} className="chip gap-2 border-[rgb(47_201_207/0.35)] text-accent-hi">
                        <span className="pixel size-[5px]" aria-hidden />
                        {o}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
