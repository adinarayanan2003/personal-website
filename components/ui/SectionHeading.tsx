import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/Reveal";

export function SectionHeading({ id, title, aside }: { id: string; title: ReactNode; aside?: ReactNode }) {
  return (
    <Reveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-12">
      <h2 id={id} className="text-[32px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[40px]">
        {title}
      </h2>
      {aside ? <p className="max-w-[380px] text-balance text-[15px] leading-relaxed text-muted md:text-right">{aside}</p> : null}
    </Reveal>
  );
}
