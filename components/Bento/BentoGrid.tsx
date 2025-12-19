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
        <section className="container mx-auto px-4 py-24">
            <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[180px] gap-3">

                {/* Large Vision Card (2x2) */}
                <VisionCard />

                {/* Tall Stack Card (1x2) */}
                <StackCard />

                {/* Small Stat Card (1x1) */}
                <StatCard />

                {/* Small Location Card (1x1) */}
                <LocationCard />

                {/* Wide GitHub Card (2x1) */}
                <GithubCard />

                {/* PROJECT: Owly Studio (2x2) */}
                <OwlyCard />

                {/* PROJECT: Agentic Video Editor (2x1) */}
                <AgenticVideoCard />

            </div>
        </section>
    );
}
