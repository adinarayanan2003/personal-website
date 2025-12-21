"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function SurroundingCube() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        // Slow, hypnotic rotation
        meshRef.current.rotation.x += delta * 0.05;
        meshRef.current.rotation.y += delta * 0.05;
    });

    return (
        <group>
            {/* The Cube surrounding the viewer */}
            <mesh ref={meshRef}>
                <boxGeometry args={[30, 30, 30]} />
                <meshBasicMaterial
                    color="#404040"
                    wireframe={true}
                    side={THREE.BackSide} // Render on the inside
                    transparent
                    opacity={0.15} // Subtle
                />
            </mesh>
        </group>
    );
}
