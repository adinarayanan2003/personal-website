"use client";

import { useEffect, useState } from "react";

import { sections } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Wayfinding for a one-page site, in place of a menu bar: a column of pixels on the
 * right edge, one per section. The current section stretches into a lit bar. Hovering
 * or focusing the rail spells out the section names. Hidden on small screens, where
 * scrolling is the navigation.
 */
export function SectionRail() {
  const [active, setActive] = useState<string>(sections[0].href);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting);
        const current = els.find((el) => visible.get(el.id));
        if (current) setActive(`#${current.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Sections"
      className="group/rail fixed right-2 top-1/2 z-40 hidden -translate-y-1/2 md:block lg:right-4"
    >
      <ol className="flex flex-col items-end">
        {sections.map((s) => {
          const on = active === s.href;
          return (
            <li key={s.href}>
              <a
                href={s.href}
                aria-current={on ? "true" : undefined}
                className="group/item flex items-center justify-end gap-3 py-[7px] pl-4 pr-2 focus-visible:outline-offset-0"
              >
                <span
                  className={cn(
                    "label translate-x-1 bg-bg/85 px-1.5 text-[10.5px] opacity-0 transition-[opacity,transform,color] duration-300 ease-soft",
                    "group-hover/rail:translate-x-0 group-hover/rail:opacity-100 group-focus-within/rail:translate-x-0 group-focus-within/rail:opacity-100",
                    on ? "text-ink" : "text-muted group-hover/item:text-ink-2",
                  )}
                >
                  {s.label}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "block h-[4px] transition-[width,background-color] duration-300 ease-soft",
                    on ? "w-[16px] bg-accent" : "w-[4px] bg-faint group-hover/item:bg-ink-2",
                  )}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
