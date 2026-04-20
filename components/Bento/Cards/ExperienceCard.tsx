"use client";

import { BentoCard } from "../BentoCard";
import { Building2 } from "lucide-react";
import { siteData } from "@/lib/data";

export default function ExperienceCard() {
    return (
        <BentoCard className="h-full">
            <div className="h-full flex flex-col p-6 sm:p-7">
                <div className="flex items-center gap-2 mb-5">
                    <Building2 className="w-5 h-5 text-cyan-300" />
                    <h3 className="text-lg font-semibold text-slate-50">Experience</h3>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                    {siteData.experience.map((exp, index) => (
                        <div key={index} className="relative pl-6 border-l-2 border-cyan-200/25">
                            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-300 ring-4 ring-slate-950" />

                            <div className="mb-2.5">
                                <h4 className="text-slate-50 font-semibold text-sm">{exp.company}</h4>
                                <p className="text-cyan-200 text-xs font-medium mt-0.5">{exp.role}</p>
                                <p className="text-slate-400 text-xs mt-1">{exp.duration} · {exp.location}</p>
                            </div>

                            <ul className="space-y-2">
                                {exp.highlights.slice(0, 2).map((highlight, idx) => (
                                    <li key={idx} className="text-slate-300 text-xs sm:text-sm flex items-start gap-2 leading-relaxed">
                                        <span className="text-cyan-300 mt-1">•</span>
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
