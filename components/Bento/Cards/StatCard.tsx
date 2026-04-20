"use client";

import { BentoCard } from "../BentoCard";

export function StatCard() {
    return (
        <BentoCard className="h-full flex flex-col justify-center p-6 text-center">
            <span className="text-6xl font-light text-slate-50 tabular-nums tracking-tighter">
                4<span className="text-cyan-200/70">+</span>
            </span>
            <span className="mt-2 text-xs font-mono tracking-[0.16em] text-slate-300 uppercase">
                Years Experience
            </span>
        </BentoCard>
    );
}
