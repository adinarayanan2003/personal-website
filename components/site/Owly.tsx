import { PixelScene } from "@/components/pixel/PixelScene";
import { ArrowUpRight } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { owly } from "@/lib/data";

export function Owly() {
  return (
    <section id="owly" aria-labelledby="owly-title" className="page-x pt-24 sm:pt-32">
      <SectionHeading
        id="owly-title"
        index="01"
        eyebrow="Now building"
        title="Owly"
        aside="Founded in 2025 in Bengaluru. Owly puts performance and creative teams in one workflow for making ads."
      />

      <Reveal className="mt-10 sm:mt-12">
        <article className="px-frame px-lg grid overflow-hidden bg-panel lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="relative aspect-[16/10] border-b border-line lg:aspect-auto lg:min-h-[540px] lg:border-b-0 lg:border-r">
            <PixelScene name={owly.scene} label={owly.sceneLabel} className="absolute inset-0" />
            <span className="label pointer-events-none absolute bottom-4 right-4 hidden text-[10.5px] text-faint md:block">
              {owly.hint}
            </span>
            <a
              href={owly.href}
              target="_blank"
              rel="noreferrer"
              className="glass px-frame px-sm group absolute bottom-4 left-4 hidden items-center gap-2 px-3.5 py-2 font-mono text-[12px] text-ink [--frame:var(--color-line-2)] hover:[--frame:rgb(244_239_231/0.35)] md:inline-flex"
            >
              {owly.hrefLabel}
              <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="flex flex-col p-6 sm:p-9 lg:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="chip border-[rgb(47_201_207/0.35)] text-accent-hi">{owly.role}</span>
              <span className="label">Since {owly.since}</span>
            </div>

            <p className="mt-6 text-[21px] leading-[1.4] tracking-[-0.015em] text-ink sm:text-[24px]">{owly.pitch}</p>

            <ol className="px-frame px-sm mt-8 grid gap-px overflow-hidden bg-line sm:grid-cols-2">
              {owly.steps.map((step, i) => (
                <li key={step.title} className="bg-panel p-4 sm:p-5">
                  <p className="label flex items-center gap-2 text-ink-2">
                    <span className="text-faint">{String(i + 1).padStart(2, "0")}</span>
                    {step.title}
                  </p>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">{step.body}</p>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-wrap gap-2">
              {owly.tech.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-auto pt-9">
              <a href={owly.href} target="_blank" rel="noreferrer" className="text-link text-[15px]">
                Visit {owly.hrefLabel}
                <ArrowUpRight className="up-right size-3.5" />
              </a>
            </div>
          </div>
        </article>
      </Reveal>
    </section>
  );
}
