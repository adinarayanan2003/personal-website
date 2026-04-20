import { HeroSection } from "@/components/Hero/HeroSection";
import { BentoGrid } from "@/components/Bento/BentoGrid";

export default function Home() {
    return (
        <main className="min-h-screen w-full text-white selection:bg-cyan-300/30 relative">
            <div className="noise-bg" />

            <HeroSection />

            <div className="relative z-10">
                <BentoGrid />
            </div>

            <footer className="py-12 text-center text-slate-400 font-mono text-xs tracking-[0.14em] uppercase">
                System Status: ONLINE /// {new Date().getFullYear()}
            </footer>
        </main>
    );
}
