"use client";

import { BentoCard } from "../BentoCard";
import Image from "next/image";
import { siteData } from "@/lib/data";

export function AgenticVideoCard() {
    // Fetch specifically the Agentic Video Editor project
    const project = siteData.projects.find(p => p.title === "Agentic Video Editor");

    if (!project) return null;

    return (
        <BentoCard className="h-full border-0 group overflow-hidden bg-black">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/agentic-video.jpg"
                    alt="Agentic Video Editor"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-8">
                <div className="mb-4">
                    {/* Tech Stack Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {project.tech.map((tech) => (
                            <span
                                key={tech}
                                className="px-2 py-0.5 text-[10px] font-mono text-purple-400 bg-purple-950/30 border border-purple-900/50 rounded-full backdrop-blur-sm"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight flex items-center gap-2">
                        {project.title}
                    </h3>
                </div>

                <p className="text-neutral-300 text-sm max-w-[400px] leading-relaxed line-clamp-3">
                    {project.description}
                </p>

                {/* Decoration */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                </div>
            </div>
        </BentoCard>
    );
}
