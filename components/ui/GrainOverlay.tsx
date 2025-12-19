"use client";

export default function GrainOverlay() {
    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden mix-blend-overlay opacity-[0.03]">
            <svg className="h-full w-full">
                <filter id="noiseFilter">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.6"
                        stitchTiles="stitch"
                        numOctaves="3"
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>
        </div>
    );
}
