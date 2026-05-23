"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Brain, Send, Sparkles, RotateCcw, BookOpen,
  ChevronRight, Lightbulb, MessageSquare, Zap,
  GraduationCap, Target, Clock,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "What's the difference between RLHF and RLAIF?",
  "How do I improve my response comparison scores?",
  "What does Outlier AI look for in annotators?",
  "Explain prompt engineering best practices",
  "How is toxicity detection scored on Scale AI?",
  "What makes a good RLHF preference judgment?",
  "How can I prepare for the coding evaluation track?",
  "What's the fastest way to reach mastery level?",
];

const QUICK_TOPICS = [
  { label: "RLHF Basics", icon: "⚖️", prompt: "Explain RLHF and why it matters for AI training jobs" },
  { label: "Evaluation Rubrics", icon: "📋", prompt: "Walk me through how to use evaluation rubrics effectively" },
  { label: "Prompt Engineering", icon: "✍️", prompt: "Teach me the key principles of prompt engineering" },
  { label: "Exam Prep", icon: "🎓", prompt: "Give me tips for passing AI trainer qualification exams" },
  { label: "Toxicity Detection", icon: "🛡️", prompt: "How do I accurately detect toxic or harmful content?" },
  { label: "Getting Hired", icon: "💼", prompt: "What's the best strategy to get hired on Outlier AI or Scale AI?" },
];

function TutorContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context] = useState({
    track: searchParams.get("track") || undefined,
    taskId: searchParams.get("taskId") || undefined,
    score: searchParams.get("score") ? Number(searchParams.get("score")) : undefined,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Welcome message
  useEffect(() => {
    const greeting =
      context.track
        ? `Hi! I'm NeuroTutor — your AI training coach. I see you're working on the **${context.track}** track${context.score !== undefined ? ` and got a score of **${context.score}/100**` : ""}. What would you like to understand better?`
        : "Hi! I'm **NeuroTutor** — your personal AI training coach. I can help you understand RLHF, response evaluation, prompt engineering, toxicity detection, and everything else you need to get hired by top AI companies.\n\nWhat would you like to learn today?";

    setMessages([{
      id: "welcome",
      role: "assistant",
      content: greeting,
      timestamp: new Date(),
    }]);
  }, [context.track, context.score]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg]
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.content })),
          context,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_ai",
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_err",
          role: "assistant",
          content: "Sorry, I had trouble responding. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function reset() {
    setMessages([{
      id: "welcome-reset",
      role: "assistant",
      content: "Chat cleared! What would you like to learn?",
      timestamp: new Date(),
    }]);
  }

  const hasConversation = messages.length > 1;

  return (
    <div className="pt-6 pb-4 h-[calc(100vh-4rem)] flex flex-col container max-w-4xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gradient">AI Tutor</Badge>
            {context.track && (
              <Badge variant="outline" className="text-xs">
                {context.track}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold">NeuroTutor</h1>
          <p className="text-sm text-muted-foreground">Your personal AI training coach</p>
        </div>
        <div className="flex items-center gap-2">
          {hasConversation && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              New chat
            </Button>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">Online</span>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto no-scrollbar rounded-2xl border border-border/50 bg-card/20 p-4 space-y-4 mb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                msg.role === "assistant"
                  ? "bg-brand-600 shadow-md shadow-brand-600/30"
                  : "bg-brand-50 border border-brand-200",
              )}>
                {msg.role === "assistant"
                  ? <Brain className="h-4 w-4 text-white" />
                  : <span className="text-xs font-bold text-primary">You</span>}
              </div>

              {/* Bubble */}
              <div className={cn(
                "max-w-[78%] rounded-2xl px-4 py-3 text-sm",
                msg.role === "assistant"
                  ? "bg-card border border-border/50"
                  : "bg-primary text-primary-foreground",
              )}>
                <MarkdownText content={msg.content} />
                <p className={cn(
                  "text-[10px] mt-1.5",
                  msg.role === "assistant" ? "text-muted-foreground" : "text-primary-foreground/60",
                )}>
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div className="bg-card border border-border/50 rounded-2xl px-4 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions (shown before first message) */}
      {!hasConversation && (
        <div className="mb-4 shrink-0">
          <div className="mb-3">
            <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" /> Quick topics
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_TOPICS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => sendMessage(t.prompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-border/50 bg-card/40 hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Suggested follow-ups (shown after conversation started) */}
      {hasConversation && !loading && (
        <div className="mb-3 shrink-0">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border border-border/50 bg-card/40 hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground"
              >
                <Sparkles className="h-3 w-3" />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0">
        <div className="flex gap-2 items-end p-2 rounded-2xl border border-border/50 bg-card/40 focus-within:border-primary/40 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask NeuroTutor anything about AI training..."
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none px-2 py-1.5 max-h-32 min-h-[2rem] placeholder:text-muted-foreground/50"
            style={{ height: "auto" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
            }}
          />
          <Button
            variant="gradient"
            size="sm"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground/50 mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

function MarkdownText({ content }: { content: string }) {
  // Simple markdown: bold (**text**), line breaks, code (`code`)
  const parts = content.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <p className="leading-relaxed whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="px-1 py-0.5 rounded bg-muted text-xs font-mono">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="pt-8 container">Loading tutor...</div>}>
      <TutorContent />
    </Suspense>
  );
}
