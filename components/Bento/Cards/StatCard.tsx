"use client";

import { BentoCard } from "../BentoCard";

export function StatCard() {
    return (
        <BentoCard className="col-span-1 row-span-1 flex flex-col justify-center p-6 text-center bg-black">
            {/* Calculated from Resume (2020/2021 start) approx 3-4 years */}
            <span className="text-6xl font-light text-white tabular-nums tracking-tighter">
                4<span className="text-neutral-600">+</span>
            </span>
            <span className="mt-2 text-xs font-medium tracking-widest text-neutral-500 uppercase">
                Years Experience
            </span>
        </BentoCard>
    );
}
