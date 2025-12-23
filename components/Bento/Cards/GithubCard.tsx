"use client";

import { BentoCard } from "../BentoCard";
import { GitCommit } from "lucide-react";

export function GithubCard() {
    const weeks = 20;
    const days = 7;

    return (
        <BentoCard className="h-full flex flex-col justify-between p-6 bg-black">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <GitCommit className="h-4 w-4 text-neutral-400" />
                    <span className="text-xs font-medium tracking-widest text-neutral-500 uppercase">Contribution Graph</span>
                </div>
                <span className="text-xs font-medium text-neutral-300">1,240 Commits</span>
            </div>

            <div className="flex gap-1 overflow-hidden opacity-80 mask-fade-right">
                {Array.from({ length: weeks }).map((_, w) => (
                    <div key={w} className="flex flex-col gap-1">
                        {Array.from({ length: days }).map((_, d) => {
                            const level = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0;
                            const colors = [
                                'bg-neutral-800',  // 0 - empty
                                'bg-neutral-700',  // 1
                                'bg-neutral-500',  // 2
                                'bg-white'         // 3 - max
                            ];

                            return (
                                <div
                                    key={d}
                                    className={`h-2 w-2 rounded-sm ${colors[level]} transition-colors duration-500`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </BentoCard>
    );
}
