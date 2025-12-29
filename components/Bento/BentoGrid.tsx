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
        <section className="container mx-auto px-4 py-12 flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl w-full">

                {/* -- ROW 1: Experience & Owly -- */}
                <div className="h-[350px] md:h-[400px]">
                    <ExperienceCard />
                </div>
                <div className="h-[350px] md:h-[400px]">
                    <OwlyCard />
                </div>

                {/* -- ROW 2: SubcompIQ & DIAG AI -- */}
                <div className="h-[350px] md:h-[400px]">
                    <SubcompIQCard />
                </div>
                <div className="h-[350px] md:h-[400px]">
                    <DiagAICard />
                </div>

                {/* -- ROW 3: Stack & Agentic Video -- */}
                <div className="h-[300px] md:h-[400px]">
                    <StackCard />
                </div>
                <div className="h-[350px] md:h-[400px]">
                    <AgenticVideoCard />
                </div>

                {/* -- ROW 4: Project eXPOS (Full Width) -- */}
                <div className="h-[300px] md:h-[350px] col-span-1 md:col-span-2">
                    <ExposCard />
                </div>

                {/* -- ROW 5: Small Stat Cards -- */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="h-[150px] sm:h-[180px]">
                        <StatCard />
                    </div>
                    <div className="h-[200px] sm:h-[180px]">
                        <GithubCard />
                    </div>
                    <div className="h-[150px] sm:h-[180px]">
                        <LocationCard />
                    </div>
                </div>

            </div>
        </section>
    );
}
