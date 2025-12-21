"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function HollowMeshSphere() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        // Slow rotation
        meshRef.current.rotation.x += delta * 0.1;
        meshRef.current.rotation.y += delta * 0.15;
    });

    return (
        <mesh ref={meshRef}>
            <icosahedronGeometry args={[4, 2]} />
            <meshBasicMaterial
                color="#444444"
                wireframe={true}
                transparent
                opacity={0.3}
            />
        </mesh>
    );
}
