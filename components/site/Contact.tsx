import { PixelField } from "@/components/pixel/PixelField";
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
          {/* The field fills the right half on wide screens and the bottom on narrow ones, so the copy stays clear. */}
          <PixelField originX={0.86} originY={0.62} radius={0.6} intensity={0.82} seed={23} mask="contact" className="-z-10" />

          <div className="p-6 pb-36 sm:p-10 sm:pb-44 lg:min-h-[460px] lg:p-14">
            <div className="flex h-full max-w-[520px] flex-col lg:min-h-[352px]">
              <h2
                id="contact-title"
                className="text-[44px] font-semibold leading-[0.98] tracking-[-0.045em] text-ink sm:text-[64px]"
              >
                Get in touch
              </h2>
              <p className="mt-6 max-w-[440px] text-[16.5px] leading-relaxed text-ink-2">
                Working on AI systems, databases or video, or just want to talk running or music? Email is
                the fastest way to reach me.
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
                      className="glass px-frame px-sm group inline-flex h-10 items-center gap-2.5 px-4 text-[13.5px] text-ink-2 transition-colors [--frame:var(--color-line-2)] hover:text-ink hover:[--frame:color-mix(in_srgb,var(--color-ink)_35%,transparent)]"
                    >
                      <Icon className="size-[15px]" />
                      <span className="sr-only">{label}: </span>
                      <span className="font-mono text-[12px]">{handle}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
