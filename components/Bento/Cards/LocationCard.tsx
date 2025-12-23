"use client";

import { BentoCard } from "../BentoCard";
import { MapPin } from "lucide-react";

export function LocationCard() {
    return (
        <BentoCard className="h-full flex flex-col justify-between p-6 bg-black">
            <div className="flex justify-end">
                <div className="relative flex items-center justify-center h-4 w-4">
                    {/* Subtle pulsing dot */}
                    <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-20 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-1">Bengaluru</h3>
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">India</p>
            </div>
        </BentoCard>
    );
}
