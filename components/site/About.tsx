import { PixelScene } from "@/components/pixel/PixelScene";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { about, offClock, stack } from "@/lib/data";

export function About() {
  const [lead, ...rest] = about;

  return (
    <section id="about" aria-labelledby="about-title" className="page-x pt-24 sm:pt-32">
      <SectionHeading id="about-title" index="04" eyebrow="About" title="The short version" />

      <div className="mt-10 grid gap-14 sm:mt-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20">
        <Reveal>
          <p className="text-[22px] leading-[1.45] tracking-[-0.015em] text-ink sm:text-[26px]">{lead}</p>
          <div className="mt-6 space-y-5 text-[16px] leading-[1.7] text-muted">
            {rest.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h3 className="label">Stack</h3>
          <dl className="mt-4 border-t border-line">
            {stack.map((row) => (
              <div
                key={row.group}
                className="grid gap-2 border-b border-line py-4 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-6"
              >
                <dt className="pt-1 text-[14px] text-ink-2">{row.group}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {row.items.map((item) => (
                    <span key={item} className="chip">
                      {item}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      <Reveal className="mt-16 sm:mt-24">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-10">
          <div>
            <p className="label flex items-center gap-2.5">
              <span className="pixel bg-warm" aria-hidden />
              Off the clock
            </p>
            <h3 className="mt-3 text-[26px] font-semibold leading-[1.1] tracking-[-0.025em] text-ink sm:text-[30px]">
              Trading, training and tracks.
            </h3>
          </div>
          <p className="max-w-[340px] text-[15px] leading-relaxed text-muted md:text-right">
            A few things that aren&apos;t on the résumé.
          </p>
        </div>

        <ul className="mt-8 grid gap-3 md:grid-cols-3">
          {offClock.map((item) => (
            <li key={item.id} className="px-frame flex flex-col overflow-hidden bg-panel">
              <div className="relative aspect-[4/3] border-b border-line">
                <PixelScene name={item.scene} label={item.sceneLabel} cell={3} className="absolute inset-0" />
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h4 className="text-[18px] font-semibold tracking-[-0.015em] text-ink">{item.title}</h4>
                  <span className="label text-[10.5px]">{item.status}</span>
                </div>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{item.body}</p>
                {item.hint ? (
                  <p className="label mt-auto hidden pt-5 text-[10.5px] text-faint [@media(hover:hover)]:block">
                    {item.hint}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
