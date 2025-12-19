"use client";

import { BentoCard } from "../BentoCard";
import Image from "next/image";

export function VisionCard() {
    return (
        <BentoCard className="col-span-1 row-span-2 md:col-span-2 md:h-full min-h-[300px] border-0 bg-black">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/vision.jpg"
                    alt="Abstract Vision"
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105 opacity-40 grayscale hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-8">
                <div className="mb-4">
                    <span className="inline-block h-1 w-10 bg-white mb-4" />
                    <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                        Building at Scale
                    </h3>
                </div>
                <p className="text-neutral-300 text-sm max-w-[320px] leading-relaxed">
                    Building AI-driven diagnostic systems at Oracle. Previously core dev at Sarcophagus DAO. Caring deeply about systems that work.
                </p>
            </div>
        </BentoCard>
    );
}
