import { HeroSection } from "@/components/Hero/HeroSection";
import { BentoGrid } from "@/components/Bento/BentoGrid";

export default function Home() {
    return (
        <main className="min-h-screen w-full bg-black text-white selection:bg-cyan-500/30">
            <div className="noise-bg" />

            <HeroSection />

            <div className="relative z-10 -mt-[10vh]">
                <BentoGrid />
            </div>

            <footer className="py-10 text-center text-neutral-600 font-mono text-xs">
                System Status: ONLINE /// {new Date().getFullYear()}
            </footer>
        </main>
    );
}
