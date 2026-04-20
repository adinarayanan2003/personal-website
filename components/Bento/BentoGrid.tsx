"use client";

import { AgenticVideoCard } from "./Cards/AgenticVideoCard";
import { StackCard } from "./Cards/StackCard";
import { StatCard } from "./Cards/StatCard";
import { LocationCard } from "./Cards/LocationCard";
import { GithubCard } from "./Cards/GithubCard";
import { OwlyCard } from "./Cards/OwlyCard";
import ExperienceCard from "./Cards/ExperienceCard";
import { SubcompIQCard } from "./Cards/SubcompIQCard";
import { DiagAICard } from "./Cards/DiagAICard";
import { ExposCard } from "./Cards/ExposCard";

export function BentoGrid() {
    return (
        <section id="work" className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 flex justify-center relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-6xl w-full">
                <div className="md:col-span-2 mb-1">
                    <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-200/80 mb-2">Selected Work</p>
                    <h2 className="text-2xl sm:text-4xl font-semibold text-slate-50">Systems and product builds that shipped</h2>
                </div>

                <div className="min-h-[340px] md:min-h-[420px]">
                    <ExperienceCard />
                </div>

                <div className="min-h-[340px] md:min-h-[420px]">
                    <OwlyCard />
                </div>

                <div className="min-h-[320px] md:min-h-[360px]">
                    <SubcompIQCard />
                </div>

                <div className="min-h-[320px] md:min-h-[360px]">
                    <DiagAICard />
                </div>

                <div className="min-h-[280px] md:min-h-[340px]">
                    <StackCard />
                </div>

                <div className="min-h-[320px] md:min-h-[340px]">
                    <AgenticVideoCard />
                </div>

                <div className="min-h-[300px] md:min-h-[340px] col-span-1 md:col-span-2">
                    <ExposCard />
                </div>

                <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="min-h-[150px] sm:min-h-[180px]">
                        <StatCard />
                    </div>

                    <div className="min-h-[170px] sm:min-h-[180px]">
                        <GithubCard />
                    </div>

                    <div className="min-h-[150px] sm:min-h-[180px]">
                        <LocationCard />
                    </div>
                </div>
            </div>
        </section>
    );
}
