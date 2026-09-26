import { Journey } from "@/components/site/Journey";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { journey } from "@/lib/data";

export function JourneySection() {
  return (
    <section id="journey" aria-labelledby="journey-title" className="page-x pt-24 sm:pt-32">
      <SectionHeading
        id="journey-title"
        index="03"
        eyebrow="Journey"
        title="How I got here"
        aside="In order, from a state rank in 2018 to what's next. Branches are the things I built on the side."
      />
      <Journey events={journey} />
    </section>
  );
}
