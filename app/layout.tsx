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
    title: "Adi Narayanan | Database Engineer & AI Systems",
    description: "Building the future, one commit at a time. Specializing in database engineering and AI systems.",
    keywords: ["database engineer", "AI systems", "software engineer", "full stack", "tech portfolio"],
    icons: {
        icon: "/favicon.png",
    },
    openGraph: {
        title: "Adi Narayanan | Database Engineer & AI Systems",
        description: "Building the future, one commit at a time. Specializing in database engineering and AI systems.",
        images: ["/og-image.png"],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Adi Narayanan | Database Engineer & AI Systems",
        description: "Building the future, one commit at a time. Specializing in database engineering and AI systems.",
        images: ["/og-image.png"],
    },
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
