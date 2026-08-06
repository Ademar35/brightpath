"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Buddy } from "@/lib/buddies";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  buddy: Buddy;
  mode: "homework" | "practice";
  questionContext?: { prompt: string; choices: string[] } | null;
  className?: string;
}

export default function ChatPanel({ buddy, mode, questionContext, className }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const loadedMode = useRef<string | null>(null);

  useEffect(() => {
    if (loadedMode.current === mode) return;
    loadedMode.current = mode;
    fetch(`/api/chat?mode=${mode}`)
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? []));
  }, [mode]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content }]);
    setStreaming(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, mode, questionContext: questionContext ?? undefined }),
      });
      if (!res.body) throw new Error("no body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = { role: "assistant", content: acc };
          return next;
        });
      }
    } catch {
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = { role: "assistant", content: "Oops, I lost my train of thought! Try again?" };
        return next;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className={`flex flex-col bg-white rounded-3xl shadow-lg overflow-hidden ${className ?? ""}`}>
      <div className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${buddy.color} text-white`}>
        <motion.span
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
          className="text-2xl inline-block"
        >
          {buddy.avatar}
        </motion.span>
        <div>
          <div className="font-display font-bold">{buddy.name}</div>
          <div className="text-xs text-white/80">{buddy.tagline}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px] max-h-[420px]">
        {messages.length === 0 && (
          <p className="text-slate-400 text-sm text-center mt-8">
            {mode === "homework" ? "Type any homework question below and I'll help you work through it!" : "Stuck? Ask me for a hint!"}
          </p>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m, i) => {
            const isLastAssistant = m.role === "assistant" && i === messages.length - 1;
            const showTyping = streaming && isLastAssistant && !m.content;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                    m.role === "user" ? "bg-indigo-600 text-white rounded-br-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm"
                  }`}
                >
                  {showTyping ? <TypingDots /> : m.content}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-slate-100 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask for a hint..."
          className="flex-1 px-3.5 py-2 rounded-full border-2 border-slate-200 focus:border-indigo-400 outline-none text-sm"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => send()}
          disabled={streaming}
          className="px-4 py-2 rounded-full bg-indigo-600 text-white font-bold text-sm disabled:opacity-50"
        >
          Send
        </motion.button>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1 py-1 px-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-slate-400"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}
