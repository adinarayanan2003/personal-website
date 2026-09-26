"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { PixelScene } from "@/components/pixel/PixelScene";
import type { Project } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Main projects as a deck. Each card pins under the header and the next one slides
 * over it; the buried card tilts back, shrinks and dims. On small screens it's a
 * plain list.
 */
export function WorkStack({ projects }: { projects: Project[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [buried, setBuried] = useState<boolean[]>(() => projects.map(() => false));

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const cards = Array.from(list.querySelectorAll<HTMLElement>("[data-card]"));
    const desktop = window.matchMedia("(min-width: 768px)");
    const state = cards.map(() => false);
    let raf = 0;

    const update = () => {
      raf = 0;
      let changed = false;
      for (let i = 0; i < cards.length; i++) {
        let covered = 0;
        if (desktop.matches && i < cards.length - 1) {
          const a = cards[i].getBoundingClientRect();
          const b = cards[i + 1].getBoundingClientRect();
          covered = Math.min(1, Math.max(0, (a.bottom - b.top) / a.height));
        }
        cards[i].style.setProperty("--covered", covered.toFixed(3));
        const isBuried = covered > 0.9;
        if (isBuried !== state[i]) {
          state[i] = isBuried;
          changed = true;
        }
      }
      if (changed) setBuried([...state]);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    desktop.addEventListener("change", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      desktop.removeEventListener("change", onScroll);
    };
  }, []);

  return (
    <ol ref={listRef} className="mt-10 space-y-5 sm:mt-12 md:space-y-0 md:pb-[8vh]">
      {projects.map((project, i) => (
        <li
          key={project.slug}
          className="md:sticky md:mb-[10vh] md:last:mb-0 md:[perspective:1600px]"
          style={{ top: `${88 + i * 16}px` } as CSSProperties}
        >
          <article
            data-card
            aria-labelledby={`${project.slug}-title`}
            className="stack-card px-frame px-lg overflow-hidden bg-panel"
          >
            <div className="grid md:h-[min(580px,calc(100svh-150px))] md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <div className="relative aspect-[16/10] border-b border-line md:aspect-auto md:border-b-0 md:border-r">
                <PixelScene
                  name={project.scene}
                  label={project.sceneLabel}
                  paused={buried[i]}
                  className="absolute inset-0"
                />
              </div>

              <div className="flex flex-col p-6 sm:p-8 lg:p-10">
                <div className="flex items-center justify-between gap-4">
                  <p className="label">{project.label}</p>
                  <p className="font-mono text-[12px] text-faint">
                    {String(i + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                  </p>
                </div>

                <h3
                  id={`${project.slug}-title`}
                  className="mt-6 text-[28px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[34px] lg:mt-8"
                >
                  {project.title}
                </h3>
                <p className="mt-3 max-w-[440px] text-[15.5px] leading-relaxed text-ink-2">{project.summary}</p>

                {project.steps ? (
                  <ol className="mt-6 space-y-3 border-t border-line pt-6 lg:mt-8">
                    {project.steps.map((step, s) => (
                      <li key={step} className="flex gap-4 text-[14.5px] leading-relaxed text-muted">
                        <span className="font-mono text-[12px] leading-[1.9] text-faint">{String(s + 1).padStart(2, "0")}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                ) : null}

                {project.hint ? (
                  <p className="label mt-auto hidden items-center gap-2 pt-7 text-[10.5px] text-faint [@media(hover:hover)]:flex">
                    <PointerIcon />
                    {project.hint}
                  </p>
                ) : null}

                <div
                  className={cn(
                    "flex flex-wrap items-center gap-2",
                    project.hint ? "mt-auto pt-7 [@media(hover:hover)]:mt-3 [@media(hover:hover)]:pt-0" : "mt-auto pt-7",
                  )}
                >
                  {project.outcome ? (
                    <span className="chip gap-2 border-[rgb(47_201_207/0.35)] text-accent-hi">
                      <span className="pixel size-[5px]" aria-hidden />
                      {project.outcome}
                    </span>
                  ) : null}
                  {project.tech.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              aria-hidden
              className={cn("stack-shade pointer-events-none absolute inset-0 bg-bg")}
            />
          </article>
        </li>
      ))}
    </ol>
  );
}

function PointerIcon() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden className="size-3" shapeRendering="crispEdges" fill="currentColor">
      <path d="M1 1h1v1H1zM1 2h2v1H1zM1 3h3v1H1zM1 4h4v1H1zM1 5h5v1H1zM1 6h6v1H1zM1 7h3v1H1zM4 7h1v2H4zM1 8h1v1H1zM5 9h1v2H5z" />
    </svg>
  );
}
