"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TRAINING_TRACKS, TRACK_COLOR_MAP, getTrack } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import { Target, Zap, Clock, ChevronRight, Filter, Sparkles, Play } from "lucide-react";

const TASK_TYPE_LABELS: Record<string, string> = {
  COMPARE_RESPONSES: "Compare Responses",
  RATE_QUALITY: "Rate Quality",
  IDENTIFY_ISSUES: "Identify Issues",
  IMPROVE_RESPONSE: "Improve Response",
  RANK_OUTPUTS: "Rank Outputs",
  ANNOTATE_TEXT: "Annotate Text",
  FACTUAL_CHECK: "Fact Check",
  SENTIMENT_LABEL: "Sentiment Label",
  TOXICITY_DETECTION: "Toxicity Detection",
  PROMPT_ENGINEERING: "Prompt Engineering",
  MULTIPLE_CHOICE: "Multiple Choice",
  FREE_RESPONSE: "Free Response",
  CODE_REVIEW: "Code Review",
  CONVERSATION_EVAL: "Conversation Eval",
  BIAS_DETECTION: "Bias Detection",
};

const SAMPLE_TASKS = [
  {
    id: "task-001",
    trackSlug: "rlhf-ranking",
    title: "Compare AI explanations of quantum entanglement",
    taskType: "COMPARE_RESPONSES",
    difficulty: 2,
    xpReward: 20,
    timeLimit: 300,
    estimatedMinutes: 3,
    totalAttempts: 1420,
    avgScore: 74,
  },
  {
    id: "task-002",
    trackSlug: "response-evaluation",
    title: "Rate the helpfulness of a customer support response",
    taskType: "RATE_QUALITY",
    difficulty: 1,
    xpReward: 15,
    timeLimit: 180,
    estimatedMinutes: 2,
    totalAttempts: 2100,
    avgScore: 82,
  },
  {
    id: "task-003",
    trackSlug: "prompt-engineering",
    title: "Improve a vague prompt to get a specific code output",
    taskType: "PROMPT_ENGINEERING",
    difficulty: 3,
    xpReward: 30,
    timeLimit: 600,
    estimatedMinutes: 6,
    totalAttempts: 890,
    avgScore: 61,
  },
  {
    id: "task-004",
    trackSlug: "toxicity-detection",
    title: "Classify a borderline hate speech example",
    taskType: "TOXICITY_DETECTION",
    difficulty: 3,
    xpReward: 25,
    timeLimit: 240,
    estimatedMinutes: 3,
    totalAttempts: 650,
    avgScore: 68,
  },
  {
    id: "task-005",
    trackSlug: "factual-verification",
    title: "Verify claims in an AI-generated history summary",
    taskType: "FACTUAL_CHECK",
    difficulty: 3,
    xpReward: 30,
    timeLimit: 480,
    estimatedMinutes: 5,
    totalAttempts: 540,
    avgScore: 58,
  },
  {
    id: "task-006",
    trackSlug: "coding-evaluation",
    title: "Find bugs in an AI-generated Python sorting function",
    taskType: "CODE_REVIEW",
    difficulty: 4,
    xpReward: 40,
    timeLimit: 600,
    estimatedMinutes: 7,
    totalAttempts: 320,
    avgScore: 55,
  },
  {
    id: "task-007",
    trackSlug: "sentiment-classification",
    title: "Label the emotional tone of product reviews",
    taskType: "SENTIMENT_LABEL",
    difficulty: 1,
    xpReward: 10,
    timeLimit: 120,
    estimatedMinutes: 2,
    totalAttempts: 3400,
    avgScore: 88,
  },
  {
    id: "task-008",
    trackSlug: "bias-detection",
    title: "Identify gender bias in an AI career advice response",
    taskType: "BIAS_DETECTION",
    difficulty: 3,
    xpReward: 30,
    timeLimit: 360,
    estimatedMinutes: 4,
    totalAttempts: 480,
    avgScore: 62,
  },
  {
    id: "task-009",
    trackSlug: "ai-writing-improvement",
    title: "Rewrite a weak AI essay paragraph for better clarity",
    taskType: "IMPROVE_RESPONSE",
    difficulty: 2,
    xpReward: 25,
    timeLimit: 600,
    estimatedMinutes: 6,
    totalAttempts: 760,
    avgScore: 71,
  },
];

const DIFF_COLORS = ["", "text-emerald-700", "text-blue-700", "text-yellow-700", "text-orange-700", "text-red-700"];
const DIFF_LABELS = ["", "Beginner", "Easy", "Medium", "Hard", "Expert"];
const DIFF_BG = ["", "bg-emerald-50 border-emerald-200", "bg-blue-50 border-blue-200", "bg-yellow-50 border-yellow-200", "bg-orange-50 border-orange-200", "bg-red-50 border-red-200"];

function PracticePageContent() {
  const searchParams = useSearchParams();
  const trackFilter = searchParams.get("track");
  const [selectedTrack, setSelectedTrack] = useState(trackFilter ?? "all");

  const tasks = selectedTrack === "all"
    ? SAMPLE_TASKS
    : SAMPLE_TASKS.filter((t) => t.trackSlug === selectedTrack);

  const track = trackFilter ? getTrack(trackFilter) : null;

  return (
    <div className="pt-8 pb-16">
      <div className="container max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          {track ? (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{track.icon}</span>
              <div>
                <Badge variant="gradient" className="mb-1">{track.name}</Badge>
                <h1 className="text-3xl font-bold tracking-tight">Practice Tasks</h1>
              </div>
            </div>
          ) : (
            <>
              <Badge variant="gradient" className="mb-3">Practice Arena</Badge>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Choose a task to practice</h1>
              <p className="text-muted-foreground">
                Real AI training tasks, instantly scored. Build skills that transfer to any AI company.
              </p>
            </>
          )}
        </div>

        {/* Track filter pills */}
        <div className="flex gap-2 flex-wrap mb-8 pb-4 border-b border-border/50">
          <button
            type="button"
            onClick={() => setSelectedTrack("all")}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm border transition-all",
              selectedTrack === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50",
            )}
          >
            All tracks
          </button>
          {TRAINING_TRACKS.slice(0, 8).map((t) => (
            <button
              type="button"
              key={t.slug}
              onClick={() => setSelectedTrack(t.slug)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border transition-all flex items-center gap-1.5",
                selectedTrack === t.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50",
              )}
            >
              <span>{t.icon}</span> {t.name.split(" ").slice(0, 2).join(" ")}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {tasks.map((task, i) => {
            const trackDef = getTrack(task.trackSlug);
            const colors = trackDef ? TRACK_COLOR_MAP[trackDef.color] ?? TRACK_COLOR_MAP.violet : TRACK_COLOR_MAP.violet;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/practice/${task.id}`}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/60 transition-all"
                >
                  {/* Task type badge */}
                  <div className={cn("shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center text-lg", colors.bg, colors.border)}>
                    {trackDef?.icon ?? "🎯"}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border", DIFF_BG[task.difficulty], DIFF_COLORS[task.difficulty])}>
                        {DIFF_LABELS[task.difficulty]}
                      </span>
                      <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border">
                        {TASK_TYPE_LABELS[task.taskType] ?? task.taskType}
                      </span>
                    </div>
                    <p className="font-medium text-sm leading-snug truncate">{task.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> ~{task.estimatedMinutes}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-400" /> +{task.xpReward} XP
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" /> Avg score: {task.avgScore}%
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <Play className="h-3 w-3" /> Start
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No tasks for this track yet.</p>
            <Button variant="outline" onClick={() => setSelectedTrack("all")}>View all tasks</Button>
          </div>
        )}

        {/* AI task generator */}
        <div className="mt-10 p-5 rounded-2xl border border-brand-200 bg-brand-50">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold">Generate unlimited practice tasks</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Use AI to generate fresh practice tasks on any topic. Perfect for targeted skill building.
          </p>
          <Button variant="gradient" size="sm" asChild>
            <Link href="/questionnaires/builder">Generate AI tasks</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="pt-8 container">Loading...</div>}>
      <PracticePageContent />
    </Suspense>
  );
}
