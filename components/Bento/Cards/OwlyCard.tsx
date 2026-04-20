"use client";

import { BentoCard } from "../BentoCard";
import Image from "next/image";
import { siteData } from "@/lib/data";
import { ArrowUpRight } from "lucide-react";

export function OwlyCard() {
    // Fetch specifically the first project which is Owly
    const project = siteData.projects.find(p => p.title === "Owly");

    if (!project) return null;

    const projectHref = `${siteData.social.github}?tab=repositories`;

    return (
        <BentoCard className="h-full border-0 group overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/owly-logo.jpg"
                    alt="Owly Studio - Mechanical Owl"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/10" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-8">
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {project.tech.map((tech) => (
                            <span
                                key={tech}
                                className="px-2 py-0.5 text-[11px] font-mono text-cyan-100 bg-cyan-400/12 border border-cyan-200/30 rounded-full backdrop-blur-sm"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>

                    <h3 className="text-2xl md:text-3xl font-semibold text-slate-50 tracking-tight leading-tight flex items-center gap-2">
                        {project.title}
                        <span className="text-[10px] font-mono text-cyan-100 font-normal px-2 py-1 border border-cyan-200/35 rounded-md bg-cyan-500/15">FEATURED</span>
                    </h3>
                </div>

                <p className="text-slate-200 text-sm max-w-[440px] leading-relaxed">
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
