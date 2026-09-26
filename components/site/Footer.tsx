import { PixelMark } from "@/components/pixel/PixelMark";
import { LocalTime } from "@/components/site/LocalTime";
import { nav, site } from "@/lib/data";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="page-x pb-10 pt-16 sm:pt-20">
      <div className="flex flex-col gap-8 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <PixelMark className="size-4 text-accent" />
          <p className="text-[13.5px] text-muted">
            © {year} {site.fullName}
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-muted">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </a>
          ))}
        </nav>

        <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted">
          {site.location.split(",")[0]} <span className="text-faint">·</span> <LocalTime timeZone={site.timeZone} /> IST
        </p>
      </div>
    </footer>
  );
}
