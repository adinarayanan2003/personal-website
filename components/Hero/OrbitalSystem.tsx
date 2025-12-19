"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import DigitalSynapse from "./DigitalSynapse";

interface OrbitalSystemProps {
    isProcessing?: boolean;
}

export default function OrbitalSystem({ isProcessing = false }: OrbitalSystemProps) {
    const groupRef = useRef<THREE.Group>(null);

    // Configuration
    const count = 4;
    const radius = 4.2; // Expanded orbit for more space

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Orbital Rotation
        // Idle: Very slow drift (0.05)
        // Processing: Cyclotron spin (2.0)
        const targetSpeed = isProcessing ? 2.0 : 0.05;
        const currentRotation = groupRef.current.rotation.y;

        // Accumulate rotation based on speed
        // We use a ref or simple addition because lerping speed on rotation value needs delta
        // Ideally we just add rotation * speed * delta

        // Let's implement inertia for the speed itself? 
        // For simplicity: just rotate.

        groupRef.current.rotation.y += targetSpeed * delta;

        // Optional: Wobble x/z for organic feel
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    });

    return (
        <group ref={groupRef}>
            {Array.from({ length: count }).map((_, i) => {
                const angle = (i / count) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;

                return (
                    <group key={i} position={[x, 0, z]}>
                        <DigitalSynapse isProcessing={isProcessing} />
                    </group>
                );
            })}
        </group>
    );
}
