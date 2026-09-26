"use client";

import { useEffect, useRef, useState } from "react";

import { PixelScene } from "@/components/pixel/PixelScene";
import type { Project } from "@/lib/data";
import { cn } from "@/lib/utils";

const PREVIEW_W = 300;
const PREVIEW_H = 188;

/**
 * Smaller projects as a list. On desktop, hovering a row brings up a live preview that
 * follows the cursor and banks with its speed. On touch, a tap opens the preview inline.
 */
export function AlsoBuilt({ items }: { items: Project[] }) {
  const listRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<number | null>(null);
  const [lastHovered, setLastHovered] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFinePointer(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (hovered !== null) setLastHovered(hovered);
  }, [hovered]);

  // Keep the last preview mounted while it fades out.
  const current = hovered ?? lastHovered;

  // Spring the preview toward the pointer, and bank it with the velocity.
  useEffect(() => {
    if (hovered === null) return;
    const el = previewRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const loop = () => {
      const p = pos.current;
      const tg = target.current;
      const k = reduce ? 1 : 0.16;
      const vx = (tg.x - p.x) * k;
      const vy = (tg.y - p.y) * k;
      p.x += vx;
      p.y += vy;
      const rotY = reduce ? 0 : Math.max(-16, Math.min(16, vx * 0.8));
      const rotX = reduce ? 0 : Math.max(-12, Math.min(12, -vy * 0.8));
      el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [hovered]);

  const aim = (clientX: number, clientY: number, snap = false) => {
    const box = listRef.current?.getBoundingClientRect();
    if (!box) return;
    // Float above the cursor so the hovered row stays readable.
    const x = Math.min(box.width - PREVIEW_W, Math.max(0, clientX - box.left - PREVIEW_W * 0.35));
    const y = clientY - box.top - PREVIEW_H - 22;
    target.current = { x, y };
    if (snap) pos.current = { x, y };
  };

  return (
    <div ref={listRef} className="relative mt-14 sm:mt-20" onPointerLeave={() => setHovered(null)}>
      <p className="label">Also built</p>
      <ul className="mt-4 border-t border-line">
        {items.map((p, i) => {
          const expanded = open === i;
          return (
            <li key={p.slug} className="border-b border-line">
              <button
                type="button"
                aria-expanded={finePointer ? undefined : expanded}
                onPointerEnter={(e) => {
                  if (e.pointerType === "touch") return;
                  aim(e.clientX, e.clientY, hovered === null);
                  setHovered(i);
                }}
                onPointerMove={(e) => e.pointerType !== "touch" && aim(e.clientX, e.clientY)}
                onFocus={(e) => {
                  if (!finePointer) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  aim(r.left + r.width * 0.6, r.top + r.height / 2, true);
                  setHovered(i);
                }}
                onBlur={() => setHovered(null)}
                onClick={() => !finePointer && setOpen(expanded ? null : i)}
                className={cn(
                  "group grid w-full gap-x-8 gap-y-2 py-5 text-left transition-colors md:grid-cols-[260px_minmax(0,1fr)_auto] md:items-center",
                  finePointer ? "cursor-default" : "cursor-pointer",
                )}
              >
                <span className="flex items-baseline gap-3">
                  <span
                    className={cn(
                      "text-[17px] font-medium tracking-[-0.01em] transition-colors",
                      hovered === i ? "text-accent-hi" : "text-ink",
                    )}
                  >
                    {p.title}
                  </span>
                  <span className="label text-[10.5px]">{p.label}</span>
                </span>
                <span className="text-[15px] leading-relaxed text-muted">
                  {p.summary}
                  {p.outcome ? <span className="text-accent-hi"> {p.outcome}.</span> : null}
                </span>
                <span className="flex flex-wrap items-center gap-2 pt-1 md:justify-end md:pt-0">
                  {p.tech.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                  {!finePointer ? (
                    <span className="ml-1 font-mono text-[12px] text-faint">{expanded ? "Hide" : "Show"}</span>
                  ) : null}
                </span>
              </button>
              {!finePointer && expanded ? (
                <div className="px-frame mb-5 overflow-hidden bg-panel [--s:4px]">
                  <PixelScene name={p.scene} label={p.sceneLabel} className="aspect-[16/10] w-full" />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {finePointer ? (
        <div
          ref={previewRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-20 will-change-transform"
          style={{ width: PREVIEW_W, height: PREVIEW_H }}
        >
          <div
            className={cn(
              "px-frame h-full w-full overflow-hidden bg-panel transition-[opacity,transform] duration-300 ease-soft [--frame:var(--color-line-2)] [--s:4px]",
              hovered !== null ? "scale-100 opacity-100" : "scale-90 opacity-0",
            )}
          >
            {current !== null ? (
              <PixelScene
                key={items[current].slug}
                name={items[current].scene}
                label=""
                active={hovered !== null}
                className="h-full w-full"
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
