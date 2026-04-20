"use client";

import { TiltWrapper } from "./TiltWrapper";
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
                "glass-card relative h-full w-full overflow-hidden rounded-3xl transition-all duration-300 hover:border-cyan-200/35",
                className
            )}
        >
            {children}
        </div>
    );

    if (noTilt) return CardContent;

    return <TiltWrapper className="h-full" rotationFactor={5}>{CardContent}</TiltWrapper>;
}
