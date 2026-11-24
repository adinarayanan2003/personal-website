"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Marker shades for hidden letters. They flicker between these while the card is in use. */
const SHADES = ["#3d3b38", "#4f4c48", "#34332f", "#46433f"];
const IDLE = 0.18;
const HOVER = 0.58; // never all the way: it's still a secret

/** Letter indices in a fixed shuffled order, so the same letters come through on every visit. */
function revealOrder(text: string) {
  const idx = [...text].flatMap((ch, i) => (/[a-z0-9]/i.test(ch) ? [i] : []));
  let s = 0x9e3779b9;
  for (let i = idx.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

/**
 * Text shown as a redacted document: most letters sit under marker bars. When `active`
 * (the card is hovered or focused), letters decode one by one, but only about half of
 * them ever do. Spaces and punctuation stay put so the word shapes read.
 */
export function Redacted({ text, active, className }: { text: string; active: boolean; className?: string }) {
  const chars = useMemo(() => [...text], [text]);
  const order = useMemo(() => revealOrder(text), [text]);
  const [level, setLevel] = useState(IDLE);
  const [seed, setSeed] = useState(0);
  const levelRef = useRef(IDLE);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = active ? HOVER : IDLE;
    if (reduce) {
      levelRef.current = target;
      setLevel(target);
      return;
    }
    const id = window.setInterval(() => {
      const cur = levelRef.current;
      const next = Math.abs(target - cur) < 0.02 ? target : cur + (target - cur) * (target > cur ? 0.12 : 0.2);
      levelRef.current = next;
      setLevel(next);
      // Blocks keep flickering while the card is in use, and settle when it isn't.
      if (active || next !== target) setSeed((v) => v + 1);
      else window.clearInterval(id);
    }, 80);
    return () => window.clearInterval(id);
  }, [active]);

  const shown = new Set(order.slice(0, Math.round(level * order.length)));

  return (
    <span className={cn("font-mono", className)}>
      <span className="sr-only">Partly redacted: {text}</span>
      <span aria-hidden>
        {chars.map((ch, i) => {
          if (!/[a-z0-9]/i.test(ch) || shown.has(i)) return <span key={i}>{ch}</span>;
          // Deterministic on the first render, so the server and the client agree. The letter
          // under the bar is a placeholder, so copying the text doesn't reveal anything.
          const shade = SHADES[(i * 7 + seed * (i % 3 === 0 ? 1 : 3)) % SHADES.length];
          return (
            <span key={i} className="text-transparent" style={{ backgroundColor: shade }}>
              x
            </span>
          );
        })}
      </span>
    </span>
  );
}
