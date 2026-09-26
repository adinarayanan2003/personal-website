"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function CopyEmail({ email, className }: { email: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "glass px-frame px-sm group inline-flex h-11 items-center gap-3 px-4 font-mono text-[12.5px] text-ink-2 transition-colors [--frame:var(--color-line-2)] hover:text-ink hover:[--frame:rgb(244_239_231/0.35)]",
        className,
      )}
    >
      <span className="truncate">{email}</span>
      <span
        aria-live="polite"
        className={cn(
          "border px-2 py-0.5 text-[10.5px] uppercase tracking-[0.1em] transition-colors",
          copied ? "border-[rgb(47_201_207/0.45)] text-accent-hi" : "border-line-2 text-muted group-hover:text-ink-2",
        )}
      >
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
