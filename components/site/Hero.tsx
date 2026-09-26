import type { CSSProperties } from "react";

import { PixelField } from "@/components/pixel/PixelField";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { LocalTime } from "@/components/site/LocalTime";
import { ArrowRight } from "@/components/ui/icons";
import { featured, site } from "@/lib/data";

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate flex min-h-[min(100svh,900px)] flex-col">
      {/* No panel edge: the field thins out behind the copy and dithers away at the bottom. */}
      <PixelField originX={0.8} originY={0.36} radius={0.62} intensity={0.84} mask="hero" className="-z-10" />

      <div className="page-x grid flex-1 items-center gap-12 pb-10 pt-28 sm:pt-32 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10 lg:pb-12 lg:pt-32">
        <div className="max-w-[660px]">
          <h1
            id="hero-title"
            className="text-[clamp(31px,9.2vw,42px)] font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-[60px] lg:text-[60px] xl:text-[68px]"
          >
            {site.headlineLines.map((line, i) => (
              <span key={line} className="rise-line" style={{ "--i": i } as CSSProperties}>
                <span>{line} </span>
              </span>
            ))}
          </h1>

          <p
            className="fade-in mt-7 max-w-[540px] text-[16.5px] leading-[1.65] text-ink-2 sm:text-[17px]"
            style={{ "--d": "260ms" } as CSSProperties}
          >
            {site.intro}
          </p>

          <div className="fade-in mt-9 flex flex-wrap items-center gap-x-8 gap-y-4" style={{ "--d": "380ms" } as CSSProperties}>
            <a href="#work" className="text-link text-[15px]">
              Selected work
              <ArrowRight className="size-3.5" />
            </a>
            <a href="#contact" className="text-link text-[15px]">
              Get in touch
              <ArrowRight className="size-3.5" />
            </a>
          </div>
        </div>

        <HeroCarousel slides={featured} />
      </div>

      {/* Where and when, like the caption on a map. */}
      <div
        className="fade-in page-x flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pb-7 font-mono text-[11.5px] uppercase tracking-[0.12em] text-muted sm:pb-9"
        style={{ "--d": "520ms" } as CSSProperties}
      >
        <p className="flex items-center gap-3">
          <span className="pixel" aria-hidden />
          <span className="text-ink-2">{site.location}</span>
          <span className="hidden text-faint sm:inline">{site.coordinates}</span>
        </p>
        <p>
          <span className="text-faint">Local time </span>
          <span className="text-ink-2">
            <LocalTime timeZone={site.timeZone} />
          </span>{" "}
          IST
        </p>
      </div>
    </section>
  );
}
