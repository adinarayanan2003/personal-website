"use client";

import { BentoCard } from "../BentoCard";

export function LocationCard() {
    return (
        <BentoCard className="h-full flex flex-col justify-between p-6">
            <div className="flex justify-end">
                <div className="relative flex items-center justify-center h-4 w-4">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-25 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-200"></span>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-slate-50 mb-1">Bengaluru</h3>
                <p className="text-xs text-slate-300 font-mono uppercase tracking-[0.16em]">India</p>
            </div>
        </BentoCard>
    );
}
