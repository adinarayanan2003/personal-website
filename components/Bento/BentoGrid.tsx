"use client";

import { AgenticVideoCard } from "./Cards/AgenticVideoCard";
import { StackCard } from "./Cards/StackCard";
import { StatCard } from "./Cards/StatCard";
import { LocationCard } from "./Cards/LocationCard";
import { GithubCard } from "./Cards/GithubCard";
import { OwlyCard } from "./Cards/OwlyCard";
import ExperienceCard from "./Cards/ExperienceCard";

export function BentoGrid() {
    return (
        <section className="container mx-auto px-4 py-12 flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl w-full">

                {/* -- ROW 1: Large Cards -- */}
                {/* Experience (Left) */}
                <div className="h-[400px]">
                    <ExperienceCard />
                </div>

                {/* Owly (Right) */}
                <div className="h-[400px]">
                    <OwlyCard />
                </div>

                {/* -- ROW 2: Large Cards -- */}
                {/* Stack (Left) */}
                <div className="h-[400px]">
                    <StackCard />
                </div>

                {/* Agentic (Right) */}
                <div className="h-[400px]">
                    <AgenticVideoCard />
                </div>

                {/* -- ROW 3: Small Stat Cards -- */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-4">
                    {/* Stats */}
                    <div className="h-[180px]">
                        <StatCard />
                    </div>

                    {/* Github */}
                    <div className="h-[180px]">
                        <GithubCard />
                    </div>

                    {/* Location */}
                    <div className="h-[180px]">
                        <LocationCard />
                    </div>
                </div>

            </div>
        </section>
    );
}
