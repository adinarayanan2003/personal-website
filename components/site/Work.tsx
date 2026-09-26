import { AlsoBuilt } from "@/components/site/AlsoBuilt";
import { WorkStack } from "@/components/site/WorkStack";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { moreProjects, projects } from "@/lib/data";

export function Work() {
  return (
    <section id="work" aria-labelledby="work-title" className="page-x pt-24 sm:pt-32">
      <SectionHeading
        id="work-title"
        index="02"
        eyebrow="Selected work"
        title={
          <>
            Agents at Oracle, video tools,
            <br className="hidden sm:block" /> and an OS from scratch.
          </>
        }
        aside="The Oracle projects are internal tools, so each one is drawn as a live diagram of how it works. Hover to play with them."
      />

      <WorkStack projects={projects} />
      <AlsoBuilt items={moreProjects} />
    </section>
  );
}
