"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Fish, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
  time: string;
};

function formatTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! 👋 Welcome to Kajjansi Aquaculture Service Center. I'm your virtual assistant. I can help you with information about our fish farming services, products, pricing, or how to get started. What can I help you with today?",
      time: "",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stamp the welcome message time on the client only (avoids SSR/client mismatch)
  useEffect(() => {
    setMessages((prev) =>
      prev.map((m, i) => (i === 0 && m.time === "" ? { ...m, time: formatTime() } : m))
    );
  }, []);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
      setHasUnread(false);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setHasUnread(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input.trim(), time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message, time: formatTime() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I'm having trouble connecting right now. Please call us at +256 700 000000 or send an email to info@kajansiaquaculture.com and we'll get back to you shortly.",
          time: formatTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const QUICK_QUESTIONS = [
    "What fish species do you sell?",
    "How much do dam liners cost?",
    "Do you construct fish ponds?",
    "How can I order fingerlings?",
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setIsOpen(true); setHasUnread(false); }}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center",
          "bg-gradient-to-br from-[#1a6b94] to-[#226640] hover:shadow-[0_8px_30px_rgba(26,107,148,0.5)] hover:scale-110",
          isOpen && "opacity-0 pointer-events-none scale-75"
        )}
        aria-label="Open chat"
      >
        <MessageCircle className="text-white" size={24} />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f4a020] rounded-full animate-pulse" />
        )}
      </button>

      {/* Chat window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[22rem] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col transition-all duration-300 origin-bottom-right",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none",
          isMinimized ? "h-16" : "h-[580px] max-h-[90vh]"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#0f5070] to-[#226640] rounded-t-2xl shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Fish size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm font-display">KASC Assistant</div>
            <div className="flex items-center gap-1.5 text-blue-100 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Online now
            </div>
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <Minimize2 size={14} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2.5 items-end",
                    msg.role === "user" && "flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                      msg.role === "assistant"
                        ? "bg-gradient-to-br from-[#1a6b94] to-[#226640]"
                        : "bg-gray-200"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <Bot size={14} className="text-white" />
                    ) : (
                      <User size={14} className="text-gray-600" />
                    )}
                  </div>
                  <div className={cn("max-w-[80%] space-y-1", msg.role === "user" && "items-end")}>
                    <div
                      className={cn(
                        "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                        msg.role === "assistant"
                          ? "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"
                          : "bg-gradient-to-br from-[#0f5070] to-[#226640] text-white rounded-br-md"
                      )}
                    >
                      {msg.content}
                    </div>
                    <div className={cn("text-xs text-gray-400 px-1", msg.role === "user" && "text-right")}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 items-end">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1a6b94] to-[#226640] flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* Quick questions */}
            {messages.length === 1 && (
              <div className="px-4 pb-3 flex flex-wrap gap-1.5 shrink-0 bg-white/80">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      setTimeout(() => inputRef.current?.focus(), 0);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-[#eef8fd] text-[#0f5070] hover:bg-[#d6eef8] border border-[#a0d4ea] transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={sendMessage}
              className="p-3 border-t border-gray-100 flex items-center gap-2 bg-white rounded-b-2xl shrink-0"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about our services…"
                className="flex-1 text-sm px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#2d8ab8] focus:bg-white transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f5070] to-[#226640] flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md transition-all active:scale-95"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
