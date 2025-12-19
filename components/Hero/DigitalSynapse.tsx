"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface DigitalSynapseProps {
    isProcessing?: boolean;
}

export default function DigitalSynapse({ isProcessing = false }: DigitalSynapseProps) {
    const count = 400; // Denser mesh as requested
    const radius = 2.2;
    const groupRef = useRef<THREE.Group>(null);
    const lightRef = useRef<THREE.PointLight>(null);
    const auraRef = useRef<THREE.Mesh>(null);

    // Generate points on a Fibonacci Sphere for perfect symmetry
    const { points, colors, connections } = useMemo(() => {
        const pts = new Float32Array(count * 3);
        const cols = new Float32Array(count * 3);
        const connectionPositions: number[] = [];

        const pVecs: THREE.Vector3[] = [];
        const goldenRatio = (1 + Math.sqrt(5)) / 2;

        for (let i = 0; i < count; i++) {
            // Fibonacci Sphere Algorithm
            const theta = 2 * Math.PI * i / goldenRatio;
            const phi = Math.acos(1 - 2 * (i + 0.5) / count);

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            // Slightly perturb radius for "organic" feel, but keep global symmetry
            // const rVar = 1.0 + (Math.random() - 0.5) * 0.1; 
            // Use precise radius for pure symmetry

            pts[i * 3] = x;
            pts[i * 3 + 1] = y;
            pts[i * 3 + 2] = z;

            pVecs.push(new THREE.Vector3(x, y, z));

            // Color (Cyan/Indigo)
            const color = new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.8, 0.6);
            cols[i * 3] = color.r;
            cols[i * 3 + 1] = color.g;
            cols[i * 3 + 2] = color.b;
        }

        // Connect close neighbors
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const dist = pVecs[i].distanceTo(pVecs[j]);
                // Tighter threshold for denser cloud (0.6 - 0.7 works well for r=1.6/c=400)
                if (dist < 0.7) {
                    connectionPositions.push(pVecs[i].x, pVecs[i].y, pVecs[i].z);
                    connectionPositions.push(pVecs[j].x, pVecs[j].y, pVecs[j].z);
                }
            }
        }

        return {
            points: pts,
            colors: cols,
            connections: new Float32Array(connectionPositions)
        };
    }, [count, radius]);

    useFrame((state) => {
        if (!groupRef.current) return;

        const time = state.clock.getElapsedTime();

        // Smooth mouse interaction
        const mouse = state.mouse;
        const targetRotationX = mouse.y * 0.2;
        const targetRotationY = mouse.x * 0.2;

        // PROCESSING STATE ANIMATION
        // Target scale: Gentle squeeze (0.8) instead of small squeeze
        const targetScale = isProcessing ? 0.8 : 1.0;
        const scaleSpeed = isProcessing ? 0.1 : 0.2;

        // Lerp Scale (Brain)
        const currentScale = groupRef.current.scale.x;
        const newScale = THREE.MathUtils.lerp(currentScale, targetScale, scaleSpeed);
        groupRef.current.scale.set(newScale, newScale, newScale);

        // Rotation Speed (Cinematic Vortex)
        const spinSpeed = isProcessing ? 4.0 : 0.05;

        // Apply Rotation
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.1);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY + time * spinSpeed, 0.1);

        // AURA & LIGHT ANIMATION
        if (auraRef.current && lightRef.current) {
            // Pulse: Natural breathing or rapid energy
            const pulse = isProcessing ? (Math.sin(time * 15) * 0.1 + 1.1) : (Math.sin(time * 2) * 0.05 + 1.0);

            // Aura gets bigger and brighter when processing
            const targetOpacity = isProcessing ? 0.2 : 0.0; // Invisible when idle, soft glow when active
            const targetScale = isProcessing ? 1.2 : 0.1;

            // Lerp Aura Props
            auraRef.current.scale.setScalar(THREE.MathUtils.lerp(auraRef.current.scale.x, targetScale * pulse, 0.1));
            // @ts-ignore - Material opacity is accessible
            if (auraRef.current.material) auraRef.current.material.opacity = THREE.MathUtils.lerp(auraRef.current.material.opacity, targetOpacity, 0.1);

            // Light Intensity
            const lightTarget = isProcessing ? (15 + Math.random() * 5) : 0;
            lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, lightTarget, 0.1);
        }
    });

    return (
        <group ref={groupRef}>
            {/* AURA SPHERE (Soft Glow, No Hard Core) */}
            <mesh ref={auraRef}>
                <sphereGeometry args={[1.2, 32, 32]} />
                <meshBasicMaterial
                    color="#00ffcc"
                    transparent
                    opacity={0}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                />
            </mesh>

            {/* Natural Energy Light Source (Invisible Source, Visible Light) */}
            <pointLight ref={lightRef} distance={10} intensity={0} color="#00ffcc" decay={2} />

            {/* Neural Lines (Wireframe) */}
            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={connections.length / 3}
                        array={connections}
                        itemSize={3}
                        args={[connections, 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#00ffcc" transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} />
            </lineSegments>

            {/* Nodes (Points) */}
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={points.length / 3}
                        array={points}
                        itemSize={3}
                        args={[points, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={colors.length / 3}
                        array={colors}
                        itemSize={3}
                        args={[colors, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.03}
                    vertexColors
                    transparent
                    opacity={0.8}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    );
}
