import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";
import GrainOverlay from "@/components/ui/GrainOverlay";

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains",
    subsets: ["latin"],
    display: "swap",
});

const spaceGrotesk = Space_Grotesk({
    variable: "--font-space",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Adinarayanan | The Tech Nexus",
    description: "Building the future, one commit at a time. Cyberpunk developer portfolio.",
    keywords: ["software engineer", "full stack", "cyberpunk", "3d portfolio"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${jetbrainsMono.variable} ${spaceGrotesk.variable} font-sans antialiased bg-black text-white selection:bg-cyan-500/30`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <GrainOverlay />
                    {children}
                    <Analytics />
                </ThemeProvider>
            </body>
        </html>
    );
}
