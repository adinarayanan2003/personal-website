"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

export default function GridTunnel() {
    const groupRef = useRef<THREE.Group>(null);

    // Infinite movement effect
    useFrame((state, delta) => {
        if (!groupRef.current) return;
        groupRef.current.position.z += delta * 2;
        if (groupRef.current.position.z > 2) {
            groupRef.current.position.z = 0;
        }
    });

    const gridColor = "#ffffff";

    // Box dimensions
    const boxWidth = 40;
    const boxHeight = 30;
    const boxDepth = 100;

    const gridDivisionsX = 20;
    const gridDivisionsY = 15;
    const gridDivisionsZ = 50;

    // Create grid lines without diagonals
    const createGridLines = (width: number, height: number, divsW: number, divsH: number) => {
        const points = [];

        // Horizontal lines
        for (let i = 0; i <= divsH; i++) {
            const y = (i / divsH - 0.5) * height;
            points.push(new THREE.Vector3(-width / 2, y, 0));
            points.push(new THREE.Vector3(width / 2, y, 0));
        }

        // Vertical lines
        for (let i = 0; i <= divsW; i++) {
            const x = (i / divsW - 0.5) * width;
            points.push(new THREE.Vector3(x, -height / 2, 0));
            points.push(new THREE.Vector3(x, height / 2, 0));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return geometry;
    };

    const floorCeilingGrid = useMemo(() => createGridLines(boxWidth, boxDepth, gridDivisionsX, gridDivisionsZ), []);
    const wallGrid = useMemo(() => createGridLines(boxDepth, boxHeight, gridDivisionsZ, gridDivisionsY), []);

    return (
        <group ref={groupRef}>
            {/* Floor */}
            <lineSegments position={[0, -boxHeight / 2, -boxDepth / 2]} rotation={[-Math.PI / 2, 0, 0]} geometry={floorCeilingGrid}>
                <lineBasicMaterial color={gridColor} transparent opacity={0.3} />
            </lineSegments>

            {/* Ceiling */}
            <lineSegments position={[0, boxHeight / 2, -boxDepth / 2]} rotation={[Math.PI / 2, 0, 0]} geometry={floorCeilingGrid}>
                <lineBasicMaterial color={gridColor} transparent opacity={0.3} />
            </lineSegments>

            {/* Left Wall */}
            <lineSegments position={[-boxWidth / 2, 0, -boxDepth / 2]} rotation={[0, Math.PI / 2, 0]} geometry={wallGrid}>
                <lineBasicMaterial color={gridColor} transparent opacity={0.3} />
            </lineSegments>

            {/* Right Wall */}
            <lineSegments position={[boxWidth / 2, 0, -boxDepth / 2]} rotation={[0, -Math.PI / 2, 0]} geometry={wallGrid}>
                <lineBasicMaterial color={gridColor} transparent opacity={0.3} />
            </lineSegments>
        </group>
    );
}
