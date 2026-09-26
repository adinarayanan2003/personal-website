import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/Reveal";

export function SectionHeading({
  id,
  index,
  eyebrow,
  title,
  aside,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <Reveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-12">
      <div>
        <p className="label flex items-center gap-2.5">
          <span className="pixel" />
          <span className="text-faint">{index}</span>
          <span>{eyebrow}</span>
        </p>
        <h2
          id={id}
          className="mt-4 text-[32px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[40px]"
        >
          {title}
        </h2>
      </div>
      {aside ? <p className="max-w-[380px] text-balance text-[15px] leading-relaxed text-muted md:text-right">{aside}</p> : null}
    </Reveal>
  );
}
