import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DeepDive } from "@/components/site/DeepDive";
import { projects } from "@/lib/data";

const dives = projects.filter((p) => p.dive?.length);

export const dynamicParams = false;

export function generateStaticParams() {
  return dives.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = dives.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = dives.findIndex((p) => p.slug === slug);
  if (i < 0) notFound();
  return <DeepDive project={dives[i]} next={dives[(i + 1) % dives.length]} />;
}
