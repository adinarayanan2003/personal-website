"use client";

import NeuralTerminal from "./NeuralTerminal";
import GridTunnel from "./GridTunnel";
import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera, Html } from "@react-three/drei";
import * as THREE from "three";
import { useState, useEffect } from "react";
import { Github, Linkedin, Twitter } from "lucide-react";
import { siteData } from "@/lib/data";

export function HeroSection() {
    const [isAIProcessing, setIsAIProcessing] = useState(false);
    const [cameraFov, setCameraFov] = useState(45);
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        const updateFov = () => {
            setCameraFov(window.innerWidth < 640 ? 55 : 45);
        };

        updateFov();
        window.addEventListener('resize', updateFov);
        return () => window.removeEventListener('resize', updateFov);
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updatePreference = () => setReduceMotion(mediaQuery.matches);
        updatePreference();
        mediaQuery.addEventListener("change", updatePreference);
        return () => mediaQuery.removeEventListener("change", updatePreference);
    }, []);

    const socialLinks = [
        { icon: Github, href: siteData.social.github, label: "GitHub" },
        { icon: Linkedin, href: siteData.social.linkedin, label: "LinkedIn" },
        { icon: Twitter, href: siteData.social.twitter, label: "Twitter" },
    ];

    return (
        <section className="relative min-h-screen w-full overflow-hidden">

            {/* 3D Scene */}
            <div className="absolute inset-0">
                <Canvas gl={{ antialias: !reduceMotion, toneMapping: THREE.ACESFilmicToneMapping }} dpr={reduceMotion ? 1 : [1, 2]}>
                    <Environment preset="studio" />

                    <fog attach="fog" args={["#050912", 42, 180]} />

                    <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={cameraFov} />

                    <group position={[0, 0, 0]}>
                        <Html
                            center
                            transform
                            position={[0, 0, 5]}
                            distanceFactor={5}
                            style={{ zIndex: 100 }}
                        >
                            <div className="w-[300px] sm:w-[360px] md:w-[420px] translate-y-[8px] sm:translate-y-[28px] pointer-events-auto">
                                <NeuralTerminal onProcessingChange={setIsAIProcessing} />
                            </div>
                        </Html>

                        {!reduceMotion && <GridTunnel />}
                    </group>
                </Canvas>
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/35 to-slate-950/70 z-10" />

            {/* Hero copy and controls */}
            <div className="relative z-20">
                <div className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-8 min-h-screen flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                        <div className="max-w-lg pointer-events-none select-none">
                            <p className="font-mono uppercase tracking-[0.22em] text-[10px] sm:text-xs text-cyan-200/85">
                                Database Engineer + AI Systems
                            </p>
                            <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold leading-[0.95] tracking-tight text-slate-50 text-glow mt-2">
                                Adi Narayanan
                            </h1>
                            <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-xl">
                                I build resilient data systems and production AI tools that reduce bug-triage latency and ship features faster.
                            </p>
                        </div>

                        <div className="z-20 flex gap-2 sm:gap-3 pointer-events-auto">
                            {socialLinks.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="group relative p-2.5 rounded-xl border border-slate-300/20 bg-slate-950/55 backdrop-blur-md hover:border-cyan-300/45 hover:bg-cyan-400/10 transition-all duration-300"
                                >
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200/90 group-hover:text-cyan-100 transition-colors duration-300" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-10 sm:pt-16 pointer-events-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <a
                                href="#work"
                                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-slate-900 bg-cyan-300 hover:bg-cyan-200 transition-colors"
                            >
                                Explore Selected Work
                            </a>
                            <a
                                href={`mailto:${siteData.email}`}
                                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-slate-100 border border-slate-300/35 bg-slate-900/55 hover:bg-slate-800/70 transition-colors"
                            >
                                Contact Me
                            </a>
                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300/20 bg-slate-950/60 text-xs font-mono uppercase tracking-[0.12em] text-slate-300">
                                <span className={`h-2 w-2 rounded-full ${isAIProcessing ? "bg-cyan-300 animate-pulse" : "bg-emerald-400"}`} />
                                Terminal {isAIProcessing ? "Processing" : "Online"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
