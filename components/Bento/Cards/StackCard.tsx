"use client";

import { BentoCard } from "../BentoCard";
import {
    Code2, Database, Terminal, Cpu, Globe,
    Layers, Box, Workflow, Zap, Command, Brain, Network
} from "lucide-react";

// Data from resume
const stack = [
    { icon: Code2, label: "Python" },
    { icon: Terminal, label: "C++" },
    { icon: Database, label: "Oracle DB" },
    { icon: Zap, label: "Next.js" },
    { icon: Layers, label: "LangChain" },
    { icon: Brain, label: "Graph RAG" },
    { icon: Box, label: "Docker" },
    { icon: Workflow, label: "System Design" },
    { icon: Globe, label: "AWS" },
    { icon: Command, label: "Linux" },
    { icon: Network, label: "Networking" },
];

export function StackCard() {
    return (
        <BentoCard className="h-full flex flex-col p-6 bg-black">
            <div className="mb-4 w-full border-b border-white/5 pb-2">
                <h3 className="text-xs font-medium tracking-widest text-neutral-500 uppercase">Technical Arsenal</h3>
            </div>

            <div className="relative flex flex-1 w-full flex-col overflow-hidden mask-fade-y">
                <div className="flex flex-col gap-5 animate-scroll-y">
                    {[...stack, ...stack].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 text-neutral-400 hover:text-white transition-colors duration-300 group">
                            <item.icon className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
                            <span className="font-medium text-sm tracking-wide">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </BentoCard>
    );
}
