"use client";

import { BentoCard } from "../BentoCard";
import {
    Code2, Database, Terminal, Globe,
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
        <BentoCard className="h-full flex flex-col p-6">
            <div className="mb-4 w-full border-b border-slate-200/10 pb-2">
                <h3 className="text-xs font-mono tracking-[0.16em] text-cyan-200/80 uppercase">Technical Arsenal</h3>
            </div>

            <p className="text-sm text-slate-300 mb-4">Production-focused stack for databases, agent systems, and full-stack delivery.</p>

            <div className="grid grid-cols-2 gap-2.5">
                {stack.map((item) => (
                    <div
                        key={item.label}
                        className="flex items-center gap-2 rounded-xl border border-slate-200/15 bg-slate-900/45 px-2.5 py-2 text-slate-200"
                    >
                        <item.icon className="h-4 w-4 text-cyan-200/85" />
                        <span className="font-medium text-xs sm:text-sm tracking-wide">{item.label}</span>
                    </div>
                ))}
            </div>
        </BentoCard>
    );
}
