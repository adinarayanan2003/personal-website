"use client";

import { BentoCard } from "../BentoCard";
import { ArrowUpRight, Github } from "lucide-react";
import { siteData } from "@/lib/data";

export function GithubCard() {
    return (
        <BentoCard className="h-full flex flex-col justify-between p-5 sm:p-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Github className="h-4 w-4 text-cyan-300" />
                    <span className="text-xs font-mono tracking-[0.15em] text-cyan-200/85 uppercase">GitHub</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-50">Open Source & Build Logs</h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    Browse repositories, experiments, and system prototypes in my public profile.
                </p>
            </div>

            <div className="pt-4">
                <a
                    href={siteData.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200/30 bg-slate-900/55 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800/70 transition-colors"
                >
                    Open GitHub Profile
                    <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
            </div>
        </BentoCard>
    );
}
