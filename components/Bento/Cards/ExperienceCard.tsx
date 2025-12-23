"use client";

import { BentoCard } from "../BentoCard";
import { Building2 } from "lucide-react";
import { siteData } from "@/lib/data";

export default function ExperienceCard() {
    return (
        <BentoCard className="h-full">
            <div className="h-full flex flex-col p-6">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-bold text-white">Experience</h3>
                </div>

                {/* Experience Timeline */}
                <div className="flex-1 space-y-6 overflow-y-auto">
                    {siteData.experience.map((exp, index) => (
                        <div key={index} className="relative pl-6 border-l-2 border-emerald-500/20">
                            {/* Timeline dot */}
                            <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-black" />

                            {/* Company & Role */}
                            <div className="mb-2">
                                <h4 className="text-white font-bold text-sm">{exp.company}</h4>
                                <p className="text-emerald-500 text-xs font-medium">{exp.role}</p>
                                <p className="text-neutral-500 text-xs mt-0.5">{exp.duration}</p>
                            </div>

                            {/* Highlights */}
                            <ul className="space-y-1.5">
                                {exp.highlights.map((highlight, idx) => (
                                    <li key={idx} className="text-neutral-400 text-xs flex items-start gap-2">
                                        <span className="text-emerald-500 mt-1">•</span>
                                        <span className="flex-1">{highlight}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </BentoCard>
    );
}
