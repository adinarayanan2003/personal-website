import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ["var(--font-space)"],
                mono: ["var(--font-jetbrains)"],
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            animation: {
                "scroll-y": "scroll-y 20s linear infinite",
                shine: "shine 8s linear infinite",
                "fade-in": "fadeIn 0.5s ease-out forwards",
                ping: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
            },
            keyframes: {
                "scroll-y": {
                    "0%": { transform: "translateY(0)" },
                    "100%": { transform: "translateY(-50%)" }
                },
                shine: {
                    "to": { backgroundPosition: "200% center" }
                },
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" }
                }
            }
        },
    },
    plugins: [],
};

export default config;
