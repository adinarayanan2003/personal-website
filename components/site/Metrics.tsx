import { Reveal } from "@/components/ui/Reveal";
import { metrics } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Metrics() {
  return (
    <section aria-label="Highlights" className="page-x pt-14 sm:pt-20">
      <ul className="grid grid-cols-2 border-y border-line lg:grid-cols-4">
        {metrics.map((m, i) => (
          <li
            key={m.value}
            className={cn(
              "border-line py-7 sm:py-9 lg:px-7",
              i % 2 === 1 ? "border-l pl-5 sm:pl-7" : "pr-4",
              i >= 2 && "border-t lg:border-t-0",
              i > 0 && "lg:border-l",
              i === 0 && "lg:pl-0",
            )}
          >
            <Reveal delay={i * 70}>
              <p className="font-mono text-[32px] font-medium leading-none tracking-[-0.05em] text-ink sm:text-[44px]">
                {m.value}
              </p>
              <p className="mt-3 max-w-[240px] text-[13.5px] leading-snug text-muted sm:text-[14px]">{m.label}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
