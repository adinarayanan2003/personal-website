import { Eras } from "@/components/site/Eras";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { eras } from "@/lib/data";

export function ErasSection() {
  return (
    <section id="eras" aria-labelledby="eras-title" className="page-x pt-24 sm:pt-32">
      <SectionHeading
        id="eras-title"
        index="03"
        eyebrow="Eras"
        title="The chapters so far"
        aside="Some of them overlapped. The DAO ran through college, and Owly started while I was at Oracle."
      />
      <Eras eras={eras} />
    </section>
  );
}
