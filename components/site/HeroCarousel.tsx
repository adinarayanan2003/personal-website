"use client";

import { useState, type CSSProperties } from "react";

import { PixelScene } from "@/components/pixel/PixelScene";
import { ArrowRight } from "@/components/ui/icons";
import type { featured as featuredData } from "@/lib/data";
import { cn } from "@/lib/utils";

type Slide = (typeof featuredData)[number];

const SLIDE_MS = 6500;

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <div
      className="fade-in w-full"
      style={{ "--d": "380ms" } as CSSProperties}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Recent work"
        className="glass px-frame overflow-hidden bg-[rgb(24_24_23/0.86)] [--frame:var(--color-line-2)]"
      >
        <div className="relative aspect-[16/9] border-b border-line">
          <PixelScene
            key={slides[index].slug}
            name={slides[index].scene}
            label={slides[index].sceneLabel}
            className="absolute inset-0"
          />
        </div>

        {/* All slides share one grid cell, so the card keeps the height of the longest one. */}
        <div className="grid p-5 sm:p-6">
          {slides.map((slide, i) => (
            <div
              key={slide.slug}
              aria-hidden={i !== index}
              className={cn(
                "col-start-1 row-start-1 transition-[opacity,transform] duration-500 ease-soft",
                i === index ? "opacity-100" : "pointer-events-none translate-y-1 opacity-0",
              )}
            >
              <p className="label text-[10.5px]">{slide.label}</p>
              <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-ink">{slide.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{slide.summary}</p>
              <a
                href={slide.target}
                tabIndex={i === index ? undefined : -1}
                className="text-link mt-5 text-[14px]"
              >
                {slide.cta}
                <ArrowRight className="size-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.slug}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${slide.title}`}
              aria-current={i === index ? "true" : undefined}
              className="group relative flex h-6 w-7 items-center"
            >
              <span className="relative block h-[2px] w-full overflow-hidden bg-line-2 transition-colors group-hover:bg-faint">
                {i === index ? (
                  <span
                    key={`${slide.slug}-${index}`}
                    onAnimationEnd={next}
                    className="slide-progress absolute inset-0 origin-left bg-ink motion-reduce:hidden"
                    style={
                      {
                        "--slide-ms": `${SLIDE_MS}ms`,
                        animationPlayState: paused ? "paused" : "running",
                      } as CSSProperties
                    }
                  />
                ) : null}
                {i === index ? <span className="absolute inset-0 hidden bg-ink motion-reduce:block" /> : null}
              </span>
            </button>
          ))}
        </div>
        <span className="label text-[10.5px]">Recent work</span>
      </div>
    </div>
  );
}
