import type { CSSProperties } from "react";

import { PixelField } from "@/components/pixel/PixelField";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { LocalTime } from "@/components/site/LocalTime";
import { ArrowRight } from "@/components/ui/icons";
import { featured, site } from "@/lib/data";

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh flex-col lg:h-svh lg:min-h-[600px]"
    >
      {/* No panel edge: the field thins out behind the copy and dithers away at the bottom. */}
      <PixelField originX={0.8} originY={0.36} radius={0.62} intensity={0.84} mask="hero" className="-z-10" />

      <div className="page-x grid min-h-0 flex-1 items-center gap-12 pb-8 pt-24 sm:pt-28 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-12 lg:pb-6 lg:pt-24">
        <div className="max-w-[760px]">
          <h1
            id="hero-title"
            className="text-[clamp(30px,8.9vw,42px)] font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-[56px] lg:text-[min(66px,4.6vw,8.4svh)]"
          >
            {site.headlineLines.map((line, i) => (
              <span key={line} className="rise-line" style={{ "--i": i } as CSSProperties}>
                <span className={i > 0 ? "text-ink-2" : undefined}>{line} </span>
              </span>
            ))}
          </h1>

          <p
            className="fade-in mt-6 max-w-[540px] text-[16px] leading-[1.65] text-ink-2 sm:text-[17px] lg:mt-[min(28px,3svh)]"
            style={{ "--d": "260ms" } as CSSProperties}
          >
            {site.intro}
          </p>

          <div
            className="fade-in mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 lg:mt-[min(36px,4svh)]"
            style={{ "--d": "380ms" } as CSSProperties}
          >
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

        {/* The card only fits beside the copy; on smaller screens the Owly section right below covers it. */}
        <div className="hidden w-full max-w-[440px] justify-self-end lg:block">
          <HeroCarousel slides={featured} />
        </div>
      </div>

      {/* Where and when, like the caption on a map. */}
      <div
        className="fade-in page-x flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pb-6 font-mono text-[11.5px] uppercase tracking-[0.12em] text-muted sm:pb-8"
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
