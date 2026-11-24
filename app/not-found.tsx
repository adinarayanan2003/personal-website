import type { Metadata } from "next";
import Link from "next/link";

import { PixelField } from "@/components/pixel/PixelField";
import { PixelMark } from "@/components/pixel/PixelMark";
import { ArrowRight } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-svh flex-col">
      <PixelField originX={0.78} originY={0.5} radius={0.55} intensity={0.7} seed={404} className="-z-10" />
      <div className="page-x flex flex-1 flex-col justify-center py-24">
        <p className="label flex items-center gap-2.5">
          <PixelMark className="size-4 text-accent" />
          <span className="text-faint">404</span>
          <span>Not found</span>
        </p>
        <h1 className="mt-5 max-w-[640px] text-[clamp(34px,7vw,56px)] font-semibold leading-[1.02] tracking-[-0.04em] text-ink">
          This page drifted off the map.
        </h1>
        <p className="mt-6 max-w-[440px] text-[16px] leading-[1.65] text-ink-2">
          The link may be old, or the address may have a typo. Everything lives on the home page.
        </p>
        <Link href="/" className="text-link mt-9 text-[15px]">
          Back to the home page
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </main>
  );
}
