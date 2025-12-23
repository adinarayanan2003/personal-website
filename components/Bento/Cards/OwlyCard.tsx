"use client";

import { BentoCard } from "../BentoCard";
import Image from "next/image";
import { siteData } from "@/lib/data";

export function OwlyCard() {
    // Fetch specifically the first project which is Owly
    const project = siteData.projects.find(p => p.title === "Owly");

    if (!project) return null;

    return (
        <BentoCard className="h-full border-0 group overflow-hidden bg-black">
            {/* Background Image - The Owl */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/owly-logo.jpg"
                    alt="Owly Studio - Mechanical Owl"
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
                                className="px-2 py-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded-full backdrop-blur-sm"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight flex items-center gap-2">
                        {project.title}
                        <span className="text-xs font-mono text-neutral-500 font-normal px-2 py-1 border border-white/10 rounded-md">LIVE</span>
                    </h3>
                </div>

                <p className="text-neutral-300 text-sm max-w-[400px] leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                    {project.description}
                </p>

                {/* Decoration */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                        </svg>
                    </div>
                </div>
            </div>
        </BentoCard>
    );
}
