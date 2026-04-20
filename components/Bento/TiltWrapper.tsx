"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";

interface TiltWrapperProps {
    children: React.ReactNode;
    className?: string;
    rotationFactor?: number;
}

export function TiltWrapper({ children, className, rotationFactor = 10 }: TiltWrapperProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isInteractive, setIsInteractive] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [rotationFactor, -rotationFactor]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-rotationFactor, rotationFactor]);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const coarsePointer = window.matchMedia("(pointer: coarse)");

        const updateInteractivity = () => {
            setIsInteractive(!prefersReducedMotion.matches && !coarsePointer.matches);
        };

        updateInteractivity();
        prefersReducedMotion.addEventListener("change", updateInteractivity);
        coarsePointer.addEventListener("change", updateInteractivity);

        return () => {
            prefersReducedMotion.removeEventListener("change", updateInteractivity);
            coarsePointer.removeEventListener("change", updateInteractivity);
        };
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseXVal = e.clientX - rect.left;
        const mouseYVal = e.clientY - rect.top;

        const xPct = mouseXVal / width - 0.5;
        const yPct = mouseYVal / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    if (!isInteractive) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateY,
                rotateX,
                transformStyle: "preserve-3d",
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
