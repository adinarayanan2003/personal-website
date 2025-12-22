"use client";

import NeuralTerminal from "./NeuralTerminal";
import GridTunnel from "./GridTunnel";
import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera, PresentationControls, Float as FloatDrei, Html } from "@react-three/drei";
import * as THREE from "three";
import { useState } from "react";

export function HeroSection() {
    const [isAIProcessing, setIsAIProcessing] = useState(false);

    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">

            {/* 3D Scene */}
            <div className="absolute inset-0">
                <Canvas gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }} dpr={[1, 2]}>
                    <Environment preset="studio" />

                    {/* Fog for infinite depth illusion */}
                    <fog attach="fog" args={["#000000", 50, 200]} />

                    <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />

                    {/* Central Group */}
                    <group position={[0, 0, 0]}>

                        {/* The Terminal */}
                        <Html
                            center
                            transform
                            position={[0, 0, 5]}
                            distanceFactor={5}
                            style={{ zIndex: 100 }}
                        >
                            <div className="w-[240px] sm:w-[320px] translate-y-[30px] pointer-events-auto">
                                <NeuralTerminal onProcessingChange={setIsAIProcessing} />
                            </div>
                        </Html>

                        {/* The Infinite Grid Tunnel (Simplified) */}
                        <GridTunnel />

                    </group>
                </Canvas>
            </div>

            {/* Brand Header - TOP CENTER */}
            <div className="absolute top-10 left-0 w-full z-20 pointer-events-none select-none text-center">
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter mix-blend-difference font-['Helvetica'] bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 via-neutral-500 to-neutral-100 bg-[length:200%_auto] animate-shine">
                        Adi Narayanan
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-400 tracking-[0.2em] mt-2 font-mono uppercase">
                        Database Engineer & AI Systems
                    </p>
                </div>
            </div>
        </section>
    );
}
