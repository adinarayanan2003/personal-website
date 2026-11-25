"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { PixelScene } from "@/components/pixel/PixelScene";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import type { Project } from "@/lib/data";
import { cn, joinWords } from "@/lib/utils";

/**
 * A project told in steps. The diagram stays pinned while the steps scroll past; each
 * step lights its part of the diagram and dims the rest. After the last step the
 * spotlight lifts and the whole thing runs.
 */
export function DeepDive({ project, next }: { project: Project; next: Project }) {
  const steps = project.dive ?? [];
  const [active, setActive] = useState(0);
  const [done, setDone] = useState(false);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const outroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // A step is "current" while it crosses the middle band of the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = stepRefs.current.indexOf(e.target as HTMLLIElement);
          if (i >= 0) setActive(i);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    stepRefs.current.forEach((el) => el && io.observe(el));

    // Once the outro reaches the middle of the screen, show the whole diagram.
    const outro = new IntersectionObserver(([e]) => setDone(e.boundingClientRect.top < window.innerHeight * 0.55), {
      threshold: [0, 0.25, 0.5, 1],
    });
    if (outroRef.current) outro.observe(outroRef.current);
    return () => {
      io.disconnect();
      outro.disconnect();
    };
  }, []);

  const focus = done ? null : (steps[active]?.focus ?? null);

  return (
    <main className="page-x pb-24 pt-10 sm:pt-14">
      <Link href="/#work" className="label inline-flex items-center gap-2 hover:text-ink">
        <ArrowRight className="size-3 rotate-180" />
        All work
      </Link>

      <header className="mt-10 max-w-[760px] sm:mt-14">
        <p className="label">{project.label}</p>
        <h1 className="mt-4 text-[clamp(36px,7vw,64px)] font-semibold leading-[1] tracking-[-0.04em] text-ink">
          {project.title}
        </h1>
        <p className="mt-6 max-w-[600px] text-[17px] leading-[1.65] text-ink-2 sm:text-[18px]">
          {project.summary}
          {project.outcome ? <span className="text-accent-hi"> {project.outcome}.</span> : null}
        </p>
      </header>

      <div className="mt-12 grid gap-10 sm:mt-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-14">
        {/* Pinned diagram: top of the screen on phones, left column on desktop. */}
        <div className="sticky top-3 z-10 self-start lg:top-[max(24px,calc(50svh-260px))]">
          <div className="px-frame px-lg relative aspect-[16/10] overflow-hidden bg-panel [--frame:var(--color-line-2)]">
            <PixelScene name={project.scene} label={project.sceneLabel} focus={focus} className="absolute inset-0" />
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5" aria-hidden>
              {steps.map((s, i) => (
                <span
                  key={s.title}
                  className={cn(
                    "block h-[3px] transition-[width,background-color] duration-300",
                    !done && i === active ? "w-5 bg-accent" : i < active || done ? "w-2 bg-ink-2" : "w-2 bg-line-2",
                  )}
                />
              ))}
            </div>
            {project.hint ? <p className="label hidden text-[10.5px] text-faint [@media(hover:hover)]:block">{project.hint}</p> : null}
          </div>
        </div>

        <div>
          <ol className="lg:pt-[18svh]">
            {steps.map((step, i) => (
              <li
                key={step.title}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                aria-current={!done && i === active ? "step" : undefined}
                className="flex min-h-[46svh] flex-col justify-center py-8 lg:min-h-[62svh]"
              >
                <h2
                  className={cn(
                    "text-[24px] font-semibold tracking-[-0.025em] transition-colors duration-500 sm:text-[28px]",
                    !done && i === active ? "text-ink" : "text-faint",
                  )}
                >
                  {step.title}
                </h2>
                <p
                  className={cn(
                    "mt-3 max-w-[440px] text-[17px] leading-[1.65] transition-colors duration-500",
                    !done && i === active ? "text-ink-2" : "text-faint",
                  )}
                >
                  {step.text}
                </p>
              </li>
            ))}
          </ol>

          <div ref={outroRef} className="border-t border-line pt-10 lg:mt-[10svh]">
            {project.story?.length ? (
              <div className="max-w-[520px] space-y-5 text-[16.5px] leading-[1.75] text-ink-2">
                {project.story.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            ) : (
              <p className="max-w-[460px] text-[16.5px] leading-[1.7] text-ink-2">{project.how}</p>
            )}
            <p className="mt-6 text-[14px] text-faint">
              Built with <span className="text-ink-2">{joinWords(project.tech)}</span>.
            </p>
            {project.href ? (
              <a href={project.href} target="_blank" rel="noreferrer" className="text-link mt-6 text-[15px]">
                Visit {new URL(project.href).hostname.replace(/^www\./, "")}
                <ArrowUpRight className="up-right size-3.5" />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <Link
        href={`/work/${next.slug}`}
        className="group mt-24 flex flex-col gap-2 border-t border-line pt-8 sm:flex-row sm:items-end sm:justify-between"
      >
        <span className="label">Next</span>
        <span className="flex items-center gap-3 text-[28px] font-semibold tracking-[-0.03em] text-ink sm:text-[36px]">
          {next.title}
          <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Link>
    </main>
  );
}
