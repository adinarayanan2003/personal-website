import { PixelField } from "@/components/pixel/PixelField";
import { AskAI } from "@/components/site/AskAI";
import { CopyEmail } from "@/components/site/CopyEmail";
import { ArrowUpRight, GitHubIcon, LinkedInIcon, XIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/data";

const socials = [
  { ...site.social.github, Icon: GitHubIcon },
  { ...site.social.linkedin, Icon: LinkedInIcon },
  { ...site.social.x, Icon: XIcon },
];

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="page-x pt-24 sm:pt-32">
      <Reveal>
        <div className="px-frame px-lg isolate overflow-hidden bg-panel">
          <PixelField originX={0.28} originY={1.02} radius={0.62} intensity={0.78} seed={23} mask="contact" className="-z-10" />

          <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14 lg:p-14">
            <div className="flex flex-col">
              <p className="label flex items-center gap-2.5">
                <span className="pixel" />
                <span className="text-faint">05</span>
                <span>Contact</span>
              </p>
              <h2
                id="contact-title"
                className="mt-4 text-[44px] font-semibold leading-[0.98] tracking-[-0.045em] text-ink sm:text-[64px]"
              >
                Get in touch
              </h2>
              <p className="mt-6 max-w-[440px] text-[16.5px] leading-relaxed text-ink-2">
                Working on AI systems, databases or video? Email is the fastest way to reach me. For Owly, the
                team is at owly.studio.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${site.email}`}
                  className="px-frame px-sm inline-flex h-11 items-center gap-2 bg-ink px-5 text-[14.5px] font-medium text-bg transition-colors [--frame:transparent] hover:bg-white"
                >
                  Email me
                  <ArrowUpRight className="size-3.5" />
                </a>
                <CopyEmail email={site.email} className="max-w-full" />
              </div>

              <ul className="mt-10 flex flex-wrap gap-2 lg:mt-auto lg:pt-12">
                {socials.map(({ label, handle, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="glass px-frame px-sm group inline-flex h-10 items-center gap-2.5 px-4 text-[13.5px] text-ink-2 transition-colors [--frame:var(--color-line-2)] hover:text-ink hover:[--frame:rgb(244_239_231/0.35)]"
                    >
                      <Icon className="size-[15px]" />
                      <span className="sr-only">{label}: </span>
                      <span className="font-mono text-[12px]">{handle}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <AskAI email={site.email} />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
