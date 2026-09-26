import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { about, recognition, stack } from "@/lib/data";

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

        <div className="space-y-12">
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

          <Reveal delay={140}>
            <h3 className="label">Recognition</h3>
            <ul className="mt-4 border-t border-line">
              {recognition.map((r) => (
                <li
                  key={r.title}
                  className="grid grid-cols-[52px_minmax(0,1fr)] gap-x-4 border-b border-line py-4 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-x-6"
                >
                  <span className="pt-0.5 font-mono text-[12.5px] text-faint">{r.year}</span>
                  <div>
                    <p className="text-[15px] font-medium text-ink">{r.title}</p>
                    <p className="mt-0.5 text-[14px] text-muted">{r.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
