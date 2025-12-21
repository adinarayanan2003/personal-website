"use client";

import { AgenticVideoCard } from "./Cards/AgenticVideoCard";
import { VisionCard } from "./Cards/VisionCard";
import { StackCard } from "./Cards/StackCard";
import { StatCard } from "./Cards/StatCard";
import { LocationCard } from "./Cards/LocationCard";
import { GithubCard } from "./Cards/GithubCard";
import { OwlyCard } from "./Cards/OwlyCard";

export function BentoGrid() {
    return (
        <section className="container mx-auto px-4 py-12 flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[160px] gap-4 max-w-5xl w-full">

                {/* -- ROW 1 & 2 -- */}
                {/* Vision (Left Large) */}
                <VisionCard />

                {/* Owly (Right Large) */}
                <OwlyCard />

                {/* -- ROW 3 & 4 -- */}
                {/* Stack (Left Tall) */}
                <StackCard />

                {/* Agentic (Center Top) */}
                <AgenticVideoCard />

                {/* Stat (Right Top) */}
                <StatCard />

                {/* Github (Center Bottom) */}
                <GithubCard />

                {/* Location (Right Bottom) */}
                <LocationCard />

            </div>
        </section>
    );
}
