import { LocalTime } from "@/components/site/LocalTime";
import { ThemeSwatches } from "@/components/site/ThemeSwitch";
import { ArrowUp } from "@/components/ui/icons";
import { site } from "@/lib/data";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="page-x pb-10 pt-16 sm:pt-20">
      <div className="flex flex-col gap-6 border-t border-line pt-8 text-[13.5px] text-muted md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <p>
            © {year} {site.fullName}
          </p>
          <ThemeSwatches />
        </div>

        <div className="flex items-center justify-between gap-8 md:justify-end">
          <p className="font-mono text-[12px] uppercase tracking-[0.08em]">
            {site.location.split(",")[0]} <span className="text-faint">·</span> <LocalTime timeZone={site.timeZone} /> IST
          </p>
          <a href="#top" className="group inline-flex items-center gap-2 transition-colors hover:text-ink">
            Back to top
            <ArrowUp className="size-3 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
