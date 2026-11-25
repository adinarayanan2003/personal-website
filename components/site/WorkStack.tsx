"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import Link from "next/link";

import { PixelScene } from "@/components/pixel/PixelScene";
import { PlayButton } from "@/components/site/GameWindow";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import type { Project } from "@/lib/data";
import { joinWords } from "@/lib/utils";

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
          style={{ top: `${28 + i * 12}px` } as CSSProperties}
        >
          <article
            data-card
            aria-labelledby={`${project.slug}-title`}
            className="stack-card px-frame px-lg overflow-hidden bg-panel"
          >
            <div className="grid md:h-[min(600px,calc(100svh-110px))] md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <div className="relative aspect-[16/10] border-b border-line md:aspect-auto md:border-b-0 md:border-r">
                <PixelScene
                  name={project.scene}
                  label={project.sceneLabel}
                  paused={buried[i]}
                  className="absolute inset-0"
                />
              </div>

              <div className="flex flex-col p-6 sm:p-8 lg:p-10">
                <p className="label">{project.label}</p>

                <h3
                  id={`${project.slug}-title`}
                  className="mt-6 text-[28px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[34px] lg:mt-8"
                >
                  {project.title}
                </h3>
                <p className="mt-3 max-w-[440px] text-[15.5px] leading-relaxed text-ink-2">
                  {project.summary}
                  {project.outcome ? <span className="text-accent-hi"> {project.outcome}.</span> : null}
                </p>

                {project.how ? (
                  <p className="mt-6 max-w-[440px] border-t border-line pt-6 text-[14.5px] leading-[1.7] text-muted lg:mt-8">
                    {project.how}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {project.dive?.length ? (
                    <Link href={`/work/${project.slug}`} className="text-link text-[14.5px]">
                      Step by step
                      <ArrowRight className="size-3.5" />
                    </Link>
                  ) : null}
                  {project.game ? <PlayButton game={project.game} className="text-[14.5px]" /> : null}
                  {project.href ? (
                    <a href={project.href} target="_blank" rel="noreferrer" className="text-link text-[14.5px]">
                      Visit {new URL(project.href).hostname.replace(/^www\./, "")}
                      <ArrowUpRight className="up-right size-3.5" />
                    </a>
                  ) : null}
                </div>

                <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-2 pt-7 text-[13.5px] leading-relaxed">
                  <p className="text-faint">
                    Built with <span className="text-ink-2">{joinWords(project.tech)}</span>.
                  </p>
                  {project.hint ? (
                    <p className="label hidden items-center gap-2 text-[10.5px] text-faint [@media(hover:hover)]:flex">
                      <PointerIcon />
                      {project.hint}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div aria-hidden className="stack-shade pointer-events-none absolute inset-0 bg-bg" />
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
