"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Terminal, Loader2 } from "lucide-react";
import { siteData } from "@/lib/data";

type Message = {
    id: string;
    role: "user" | "model";
    content: string;
};

interface NeuralTerminalProps {
    onProcessingChange?: (isProcessing: boolean) => void;
}

export default function NeuralTerminal({ onProcessingChange }: NeuralTerminalProps) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "model",
            content: "Ask me anything about Adi."
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Notify parent of loading state changes
    useEffect(() => {
        onProcessingChange?.(isLoading);
    }, [isLoading, onProcessingChange]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSystemCommand = (cmd: string): boolean => {
        const lowerCmd = cmd.toLowerCase().trim();

        if (lowerCmd === "help") {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "model",
                content: `
Available Commands:
- **help**: Show this menu
- **clear**: Clear terminal history
- **stack**: View tech stack details
- **projects**: List highlighted projects
- **socials**: List connection endpoints
                `
            }]);
            return true;
        }

        if (lowerCmd === "clear") {
            setMessages([
                {
                    id: Date.now().toString(),
                    role: "model",
                    content: "Session cleared. Ask me about projects, systems, or experience."
                }
            ]);
            return true;
        }

        if (lowerCmd === "stack") {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "model",
                content: "Core Stack: Python, LangChain, Next.js, Oracle DB, Docker, AWS."
            }]);
            return true;
        }

        if (lowerCmd === "projects") {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "model",
                content: siteData.projects.map((project) => `- ${project.title}`).join("\n")
            }]);
            return true;
        }

        if (lowerCmd === "socials") {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "model",
                content: `
- GitHub: ${siteData.social.github}
- LinkedIn: ${siteData.social.linkedin}
- X: ${siteData.social.twitter}
                `
            }]);
            return true;
        }

        return false;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        // Check for system commands first
        if (handleSystemCommand(userMsg.content)) {
            setIsLoading(false);
            return;
        }

        // Send to LLM
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMsg] }),
            });

            if (!response.ok) throw new Error(response.statusText);
            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: "model", content: "" },
            ]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = decoder.decode(value, { stream: true });

                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;
                    const lastMsg = newMessages[lastIndex];
                    // Immutable update to prevent React state anomalies
                    newMessages[lastIndex] = {
                        ...lastMsg,
                        content: lastMsg.content + text
                    };
                    return newMessages;
                });
            }
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                { id: Date.now().toString(), role: "model", content: "Error: Neuralink disconnected." },
            ]);
        } finally {
            setIsLoading(false);
            // Re-focus input after response
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    return (
        <div className="w-full max-w-xl relative group">
            <div className="absolute inset-1 bg-gradient-to-r from-emerald-400/25 to-cyan-300/30 rounded-xl blur-lg opacity-30 group-hover:opacity-60 transition duration-700" />

            <div className="w-full h-[220px] sm:h-[280px] md:h-[320px] bg-slate-950/96 border border-slate-300/25 rounded-xl overflow-hidden font-mono flex flex-col shadow-2xl relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-slate-300/10 select-none bg-slate-800/40 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300/90 font-semibold tracking-[0.18em] text-[10px]">ADI_TERMINAL</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                </div>

                {/* Output Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-2.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/15">
                    {messages.map((m) => (
                        <div key={m.id} className="group animate-fade-in">
                            <div className="flex items-start gap-2">
                                <span className={`mt-0.5 shrink-0 text-[10px] sm:text-[11px] ${m.role === 'user' ? 'text-slate-400' : 'text-emerald-400'}`}>
                                    {m.role === 'user' ? '$' : '>'}
                                </span>
                                <div className={`prose prose-invert prose-p:leading-relaxed prose-xs max-w-none text-[11px] sm:text-xs ${m.role === 'user' ? 'text-slate-100' : 'text-slate-300'}`}>
                                    <ReactMarkdown>{m.content}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex items-center gap-2 text-emerald-300/70 pl-3 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="text-[11px]">Processing...</span>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form
                    onSubmit={handleSubmit}
                    className="px-3 sm:px-4 py-2.5 bg-slate-800/40 border-t border-slate-300/10 flex items-center gap-2 rounded-b-xl"
                    onClick={() => inputRef.current?.focus()}
                >
                    <span className="text-emerald-400 font-bold text-sm">$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        className="flex-1 bg-transparent outline-none text-emerald-100 placeholder:text-slate-500 font-medium disabled:opacity-50 text-xs sm:text-sm"
                        placeholder={isLoading ? "Systems processing..." : "Try: projects, stack, socials"}
                        autoComplete="off"
                        autoFocus
                    />
                </form>
            </div>
        </div>
    );
}
