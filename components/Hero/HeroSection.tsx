"use client";

import NeuralTerminal from "./NeuralTerminal";
import GridTunnel from "./GridTunnel";
import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera, PresentationControls, Float as FloatDrei, Html } from "@react-three/drei";
import * as THREE from "three";
import { useState, useEffect } from "react";
import { Github, Linkedin, Twitter } from "lucide-react";
import { siteData } from "@/lib/data";

export function HeroSection() {
    const [isAIProcessing, setIsAIProcessing] = useState(false);
    const [cameraFov, setCameraFov] = useState(45);

    useEffect(() => {
        const updateFov = () => {
            setCameraFov(window.innerWidth < 640 ? 55 : 45);
        };

        updateFov();
        window.addEventListener('resize', updateFov);
        return () => window.removeEventListener('resize', updateFov);
    }, []);

    const socialLinks = [
        { icon: Github, href: siteData.social.github, label: "GitHub" },
        { icon: Linkedin, href: siteData.social.linkedin, label: "LinkedIn" },
        { icon: Twitter, href: siteData.social.twitter, label: "Twitter" },
    ];

    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">

            {/* 3D Scene */}
            <div className="absolute inset-0">
                <Canvas gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }} dpr={[1, 2]}>
                    <Environment preset="studio" />

                    {/* Fog for infinite depth illusion */}
                    <fog attach="fog" args={["#000000", 50, 200]} />

                    <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={cameraFov} />

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
                            <div className="w-[280px] sm:w-[320px] translate-y-[10px] sm:translate-y-[30px] pointer-events-auto">
                                <NeuralTerminal onProcessingChange={setIsAIProcessing} />
                            </div>
                        </Html>

                        {/* The Infinite Grid Tunnel (Simplified) */}
                        <GridTunnel />

                    </group>
                </Canvas>
            </div>

            {/* Brand Header - TOP CENTER */}
            <div className="absolute top-4 sm:top-10 left-0 w-full z-20 pointer-events-none select-none text-center">
                <div className="container mx-auto px-4 sm:px-6">
                    <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold tracking-tighter mix-blend-difference font-['Helvetica'] bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 via-neutral-500 to-neutral-100 bg-[length:200%_auto] animate-shine">
                        Adi Narayanan
                    </h1>
                    <p className="text-[9px] sm:text-xs md:text-sm text-neutral-400 tracking-[0.15em] sm:tracking-[0.2em] mt-1 sm:mt-2 font-mono uppercase">
                        Database Engineer & AI Systems
                    </p>
                </div>
            </div>

            {/* Social Links - TOP RIGHT */}
            <div className="absolute top-4 sm:top-10 right-4 sm:right-10 z-20 flex gap-3 pointer-events-auto">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                    <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="group relative p-2 rounded-full border border-neutral-700/50 bg-black/30 backdrop-blur-sm 
                                 hover:border-emerald-500/50 hover:bg-emerald-500/10 
                                 transition-all duration-300 ease-out
                                 hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/20"
                    >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 group-hover:text-emerald-400 transition-colors duration-300" />

                        {/* Glow effect on hover */}
                        <span className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

                        {/* Tooltip */}
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] text-emerald-400 bg-black/80 border border-emerald-500/30 rounded 
                                       opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            {label}
                        </span>
                    </a>
                ))}
            </div>
        </section>
    );
}
