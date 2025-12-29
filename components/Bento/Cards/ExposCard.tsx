"use client";

import { BentoCard } from "../BentoCard";
import { siteData } from "@/lib/data";
import Image from "next/image";

export function ExposCard() {
    const project = siteData.projects.find(p => p.title === "Project eXPOS");
    if (!project) return null;

    return (
        <BentoCard className="h-full border-0 group overflow-hidden bg-black">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/expos.png"
                    alt="Project eXPOS - Experimental OS"
                    fill
                    className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-end h-full p-6">
                {/* Tech Stack Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {project.tech.map((tech) => (
                        <span
                            key={tech}
                            className="px-2 py-1 text-[10px] font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30"
                        >
                            {tech}
                        </span>
                    ))}
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                    {project.title}
                </h3>

                <p className="text-neutral-400 text-sm leading-relaxed">
                    {project.description}
                </p>
            </div>
        </BentoCard>
    );
}
