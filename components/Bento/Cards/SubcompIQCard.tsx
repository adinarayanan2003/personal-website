"use client";

import { BentoCard } from "../BentoCard";
import { siteData } from "@/lib/data";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function SubcompIQCard() {
    const project = siteData.projects.find(p => p.title === "SubcompIQ");
    if (!project) return null;

    const projectHref = `${siteData.social.github}?tab=repositories`;

    return (
        <BentoCard className="h-full border-0 group overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/subcompiq.png"
                    alt="SubcompIQ - Graph RAG System"
                    fill
                    className="object-cover opacity-70 group-hover:opacity-85 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col justify-end h-full p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                    {project.tech.map((tech) => (
                        <span
                            key={tech}
                            className="px-2 py-0.5 text-[11px] font-mono bg-cyan-500/15 text-cyan-100 rounded-full border border-cyan-200/35"
                        >
                            {tech}
                        </span>
                    ))}
                </div>

                <h3 className="text-2xl font-semibold text-slate-50 mb-2 tracking-tight">
                    {project.title}
                </h3>

                <p className="text-slate-200 text-sm leading-relaxed">
                    {project.description}
                </p>

                <a
                    href={projectHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-fit items-center gap-1 rounded-lg border border-slate-200/30 bg-slate-900/55 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800/70 transition-colors"
                >
                    View Code
                    <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
            </div>
        </BentoCard>
    );
}
