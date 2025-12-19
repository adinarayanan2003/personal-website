"use client";

import { TiltWrapper } from "./TiltWrapper";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface BentoCardProps {
    children: React.ReactNode;
    className?: string;
    noTilt?: boolean;
}

export function BentoCard({ children, className, noTilt = false }: BentoCardProps) {
    const CardContent = (
        <div
            className={twMerge(
                "glass-card relative h-full w-full overflow-hidden rounded-2xl transition-all duration-500 hover:border-white/20 hover:bg-black/80",
                className
            )}
        >
            {children}
        </div>
    );

    if (noTilt) return CardContent;

    return <TiltWrapper className={className} rotationFactor={10}>{CardContent}</TiltWrapper>;
}
