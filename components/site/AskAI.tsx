"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { PixelMark } from "@/components/pixel/PixelMark";
import { ArrowUp } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type Message = { id: number; role: "user" | "model"; content: string; error?: boolean };

const SUGGESTIONS = ["What is Owly?", "What did you build at Oracle?", "What's your stack?"];
const MAX_INPUT = 500;

/** Tiny formatter for model replies: paragraphs, "- " bullets, **bold** and `code`. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-medium text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="font-mono text-[0.92em] text-accent-hi">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function Formatted({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];

  const flush = () => {
    if (!list.length) return;
    const items = list;
    blocks.push(
      <ul key={`l${blocks.length}`} className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="pixel mt-[9px] size-[4px] bg-accent-dim" aria-hidden />
            <span>{inline(item)}</span>
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const bullet = line.match(/^(?:[-*•]|\d+\.)\s+(.*)$/);
    if (bullet) {
      list.push(bullet[1]);
      continue;
    }
    flush();
    if (line) blocks.push(<p key={`p${blocks.length}`}>{inline(line.replace(/^#+\s*/, ""))}</p>);
  }
  flush();

  return <div className="space-y-2.5">{blocks}</div>;
}

export function AskAI({ email }: { email: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function ask(question: string) {
    const q = question.trim().slice(0, MAX_INPUT);
    if (!q || busy) return;

    const history = messages
      .filter((m) => !m.error && m.content)
      .map(({ role, content }) => ({ role, content }));
    const userId = ++nextId.current;
    const replyId = ++nextId.current;

    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: q },
      { id: replyId, role: "model", content: "" },
    ]);
    setInput("");
    setBusy(true);

    const update = (fn: (m: Message) => Message) =>
      setMessages((prev) => prev.map((m) => (m.id === replyId ? fn(m) : m)));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...history, { role: "user", content: q }].slice(-10) }),
      });
      if (!res.ok || !res.body) throw new Error(String(res.status));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) update((m) => ({ ...m, content: m.content + chunk }));
      }
      update((m) =>
        m.content.trim() ? m : { ...m, content: `I don't have a good answer for that. Try emailing ${email}.`, error: true },
      );
    } catch (err) {
      const status = (err as Error).message;
      update((m) => {
        if (m.content.trim()) return { ...m, content: `${m.content}\n\nThe answer got cut off. Try asking again.` };
        return {
          ...m,
          error: true,
          content:
            status === "429"
              ? "That's a lot of questions in a short time. Give it a minute and try again."
              : `My AI is offline right now. You can email me at ${email}.`,
        };
      });
    } finally {
      setBusy(false);
      inputRef.current?.focus({ preventScroll: true });
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(input);
  };

  return (
    <div className="glass px-frame flex h-[440px] min-w-0 flex-col overflow-hidden [--frame:var(--color-line-2)] sm:h-[480px]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <PixelMark className="size-4 text-accent" />
          <p className="text-[14px] font-medium text-ink">Ask my AI</p>
        </div>
        <span className="label text-[10.5px]">Knows this page</span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-5" aria-live="polite">
        {messages.length === 0 ? (
          <div className="flex gap-3">
            <PixelMark className="mt-[5px] size-3.5 flex-none text-accent" />
            <div className="min-w-0 flex-1">
              <p className="max-w-[420px] text-[14.5px] leading-relaxed text-ink-2">
                Hi, I&apos;m an AI that answers as Adi. I know what&apos;s on this page, so ask me about Owly, my work
                at Oracle, the projects or what I do off the clock.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void ask(s)}
                    className="chip cursor-pointer transition-colors hover:border-line-2 hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <p className="px-frame px-sm max-w-[85%] bg-[rgb(244_239_231/0.08)] px-3.5 py-2 text-[14.5px] leading-relaxed text-ink [--frame:transparent]">
                  {m.content}
                </p>
              </div>
            ) : (
              <div key={m.id} className="flex gap-3">
                <PixelMark className="mt-[5px] size-3.5 flex-none text-accent" />
                <div
                  className={cn(
                    "min-w-0 flex-1 text-[14.5px] leading-relaxed",
                    m.error ? "text-muted" : "text-ink-2",
                  )}
                >
                  {m.content ? (
                    <Formatted text={m.content} />
                  ) : (
                    <span className="pixel-typing" aria-label="Thinking">
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                </div>
              </div>
            ),
          )
        )}
      </div>

      <div className="border-t border-line p-3">
        <form
          onSubmit={onSubmit}
          className="px-frame px-sm flex items-center gap-2 bg-[rgb(20_20_20/0.6)] pl-4 pr-1.5 [--frame:var(--color-line-2)] focus-within:[--frame:rgb(47_201_207/0.6)]"
        >
          <label htmlFor="ask-ai" className="sr-only">
            Ask a question
          </label>
          <input
            ref={inputRef}
            id="ask-ai"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={MAX_INPUT}
            placeholder="Ask about my work..."
            autoComplete="off"
            className="h-11 min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-faint focus-visible:outline-none sm:text-[14.5px]"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send question"
            className="px-frame px-sm grid size-8 flex-none place-items-center bg-ink text-bg transition-opacity [--frame:transparent] disabled:opacity-25"
          >
            <ArrowUp className="size-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
