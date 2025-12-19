"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Terminal, Loader2 } from "lucide-react";

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
- **socials**: List connection endpoints
                `
            }]);
            return true;
        }

        if (lowerCmd === "clear") {
            setMessages([]);
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
        <div className="w-full max-w-lg relative group">
            {/* Subtle Glow effect behind - Reduced intensity */}
            <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition duration-700" />

            <div className="w-full h-[400px] bg-black border border-neutral-800 rounded-lg overflow-hidden font-mono flex flex-col shadow-2xl relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 select-none bg-white/5 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-500/80 font-bold tracking-wider text-xs">ADI_TERMINAL</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                </div>

                {/* Output Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                    {messages.map((m) => (
                        <div key={m.id} className="group animate-fade-in">
                            <div className="flex items-start gap-3">
                                <span className={`mt-1 shrink-0 ${m.role === 'user' ? 'text-neutral-500' : 'text-emerald-500'}`}>
                                    {m.role === 'user' ? '$' : '>'}
                                </span>
                                <div className={`prose prose-invert prose-p:leading-relaxed prose-sm max-w-none ${m.role === 'user' ? 'text-white' : 'text-neutral-300'}`}>
                                    <ReactMarkdown>{m.content}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex items-center gap-2 text-emerald-500/50 pl-6 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="text-xs">Processing...</span>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form
                    onSubmit={handleSubmit}
                    className="p-4 bg-white/5 border-t border-white/5 flex items-center gap-2 rounded-b-xl"
                    onClick={() => inputRef.current?.focus()}
                >
                    <span className="text-emerald-500 font-bold">$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        className="flex-1 bg-transparent outline-none text-emerald-100 placeholder:text-neutral-600 font-medium disabled:opacity-50"
                        placeholder={isLoading ? "Systems processing..." : "Initialize command..."}
                        autoComplete="off"
                        autoFocus
                    />
                </form>
            </div>
        </div>
    );
}
