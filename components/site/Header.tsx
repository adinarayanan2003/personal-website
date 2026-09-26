"use client";

import { useEffect, useState } from "react";

import { PixelMark } from "@/components/pixel/PixelMark";
import { nav, site } from "@/lib/data";
import { cn } from "@/lib/utils";

const MOBILE_HIDDEN = new Set(["#journey", "#about"]);

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const sections = nav
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting);
        const current = sections.find((el) => visible.get(el.id));
        setActive(current ? `#${current.id}` : null);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((el) => io.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-24 bg-linear-to-b from-bg via-bg/70 to-transparent transition-opacity duration-300",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="page-x relative flex items-center justify-between gap-3 pt-3 sm:pt-4">
        <a
          href="#top"
          aria-label={`${site.name}, back to top`}
          className={cn(
            "px-frame px-sm pointer-events-auto flex h-11 items-center gap-2.5 px-3.5 transition-[background-color,backdrop-filter] duration-300 sm:px-4",
            scrolled ? "glass [--frame:var(--color-line-2)]" : "[--frame:transparent]",
          )}
        >
          <PixelMark className="size-[18px] text-accent" />
          <span className="text-[14.5px] font-medium tracking-[-0.01em] text-ink">{site.name}</span>
        </a>

        <nav
          aria-label="Primary"
          className="glass px-frame px-sm pointer-events-auto flex h-11 items-center px-1.5 text-[13px] [--frame:var(--color-line-2)] sm:text-[13.5px]"
        >
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? "true" : undefined}
              className={cn(
                "relative px-2.5 py-1.5 text-muted transition-colors duration-200 hover:text-ink focus-visible:outline-offset-[-2px] sm:px-3.5",
                active === item.href && "text-ink",
                MOBILE_HIDDEN.has(item.href) && "hidden sm:block",
              )}
            >
              {active === item.href ? (
                <span aria-hidden className="absolute inset-y-1 inset-x-0 bg-[rgb(244_239_231/0.08)]" />
              ) : null}
              <span className="relative">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
