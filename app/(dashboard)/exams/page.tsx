"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TRAINING_TRACKS, TRACK_COLOR_MAP, getTrack } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import {
  Trophy, Clock, Target, Zap, Lock, ChevronRight,
  CheckCircle2, Star, AlertTriangle, Play,
} from "lucide-react";

const EXAMS = [
  {
    id: "exam-rlhf-basic",
    trackSlug: "rlhf-ranking",
    title: "RLHF Fundamentals Qualification",
    description: "Simulates the Outlier AI RLHF qualification screening. Tests your ability to compare and rank AI responses across diverse domains.",
    timeLimit: 1800,
    questions: 20,
    passingScore: 70,
    difficulty: 2,
    attempts: 3,
    totalPassed: 1240,
    totalAttempted: 2100,
    topics: ["Side-by-side comparison", "Multi-response ranking", "Quality dimensions", "Preference justification"],
  },
  {
    id: "exam-eval-pro",
    trackSlug: "response-evaluation",
    title: "AI Response Evaluation — Level 1",
    description: "Mirrors the Scale AI tasker qualification. Evaluate AI responses using structured rubrics across helpfulness, safety, accuracy, and clarity.",
    timeLimit: 2400,
    questions: 25,
    passingScore: 75,
    difficulty: 2,
    attempts: 3,
    totalPassed: 890,
    totalAttempted: 1560,
    topics: ["Rubric application", "Quality scoring", "Issue identification", "Structured feedback"],
  },
  {
    id: "exam-prompt-eng",
    trackSlug: "prompt-engineering",
    title: "Prompt Engineering Certification",
    description: "Tests your ability to write, refine, and troubleshoot prompts for complex AI tasks. Required for most Alignerr projects.",
    timeLimit: 3000,
    questions: 15,
    passingScore: 72,
    difficulty: 3,
    attempts: 3,
    totalPassed: 430,
    totalAttempted: 980,
    topics: ["Prompt clarity", "Instruction design", "Context setting", "Output control"],
  },
  {
    id: "exam-toxicity",
    trackSlug: "toxicity-detection",
    title: "Content Safety & Toxicity Screening",
    description: "Identify harmful content including hate speech, misinformation, NSFW material, and policy violations. Standard test for AI safety roles.",
    timeLimit: 1500,
    questions: 30,
    passingScore: 80,
    difficulty: 3,
    attempts: 2,
    totalPassed: 310,
    totalAttempted: 720,
    topics: ["Hate speech detection", "Misinformation", "Policy compliance", "Edge cases"],
  },
  {
    id: "exam-coding",
    trackSlug: "coding-evaluation",
    title: "Code Quality Evaluation — Python/JS",
    description: "Evaluate AI-generated code for correctness, efficiency, security, and style. High-paying track requiring real programming knowledge.",
    timeLimit: 3600,
    questions: 12,
    passingScore: 70,
    difficulty: 4,
    attempts: 3,
    totalPassed: 180,
    totalAttempted: 520,
    topics: ["Bug detection", "Code correctness", "Performance", "Security issues"],
  },
  {
    id: "exam-math-science",
    trackSlug: "math-science-eval",
    title: "Math & Science Expert Qualification",
    description: "Premium track for STEM specialists. Evaluate AI solutions to math, physics, and logic problems. Highest pay rates on all platforms.",
    timeLimit: 4200,
    questions: 10,
    passingScore: 75,
    difficulty: 5,
    attempts: 3,
    totalPassed: 95,
    totalAttempted: 340,
    topics: ["Mathematical reasoning", "Step verification", "Scientific accuracy", "Logic proofs"],
  },
];

const DIFF_LABELS = ["", "Beginner", "Easy", "Intermediate", "Advanced", "Expert"];
const DIFF_COLORS = ["", "text-emerald-700", "text-blue-700", "text-yellow-700", "text-orange-700", "text-red-700"];
const DIFF_BG = ["", "bg-emerald-50 border-emerald-200", "bg-blue-50 border-blue-200", "bg-yellow-50 border-yellow-200", "bg-orange-50 border-orange-200", "bg-red-50 border-red-200"];

function ExamsContent() {
  const searchParams = useSearchParams();
  const trackFilter = searchParams.get("track");
  const [selected, setSelected] = useState<typeof EXAMS[0] | null>(null);

  const exams = trackFilter ? EXAMS.filter((e) => e.trackSlug === trackFilter) : EXAMS;

  return (
    <div className="pt-8 pb-16">
      <div className="container max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="gradient" className="mb-3">Qualification Exams</Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Mock qualification tests
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Timed, scored, pass/fail — identical to real AI company screening tests.
            Pass here first, then apply with confidence.
          </p>
        </div>

        {/* Info bar */}
        <div className="grid grid-cols-3 gap-4 mb-8 p-4 rounded-2xl border border-border/50 bg-card/30">
          {[
            { icon: Trophy, label: "Avg pass rate", value: "58%" },
            { icon: Clock, label: "Avg exam time", value: "30–70 min" },
            { icon: Target, label: "Exams available", value: `${EXAMS.length}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <Icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-lg font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        <div className={cn("grid gap-6", selected ? "lg:grid-cols-2" : "")}>
          {/* Exam list */}
          <div className="space-y-4">
            {exams.map((exam, i) => {
              const track = getTrack(exam.trackSlug);
              const colors = track ? TRACK_COLOR_MAP[track.color] ?? TRACK_COLOR_MAP.violet : TRACK_COLOR_MAP.violet;
              const passRate = Math.round((exam.totalPassed / exam.totalAttempted) * 100);
              const timeMins = Math.floor(exam.timeLimit / 60);

              return (
                <motion.button
                  type="button"
                  key={exam.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setSelected(selected?.id === exam.id ? null : exam)}
                  className={cn(
                    "w-full p-5 rounded-2xl border text-left transition-all",
                    selected?.id === exam.id
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={cn("w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 mt-0.5", colors.bg, colors.border)}>
                        {track?.icon ?? "🎯"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border", DIFF_BG[exam.difficulty], DIFF_COLORS[exam.difficulty])}>
                            {DIFF_LABELS[exam.difficulty]}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{passRate}% pass rate</span>
                        </div>
                        <h3 className="font-semibold text-sm mb-1 leading-snug">{exam.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{exam.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeMins} min</span>
                          <span className="flex items-center gap-1"><Target className="h-3 w-3" />{exam.questions} questions</span>
                          <span className="flex items-center gap-1"><Trophy className="h-3 w-3" />Pass: {exam.passingScore}%</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 shrink-0 mt-1 transition-transform", selected?.id === exam.id && "rotate-90")} />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Exam detail panel */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-2xl border border-primary/20 bg-card/40 h-fit sticky top-24"
            >
              <h2 className="font-bold text-lg mb-1">{selected.title}</h2>
              <p className="text-sm text-muted-foreground mb-5">{selected.description}</p>

              <div className="space-y-3 mb-5">
                {[
                  { label: "Time limit", value: `${Math.floor(selected.timeLimit / 60)} minutes` },
                  { label: "Questions", value: `${selected.questions} tasks` },
                  { label: "Passing score", value: `${selected.passingScore}%` },
                  { label: "Max attempts", value: `${selected.attempts} per week` },
                  { label: "Pass rate", value: `${Math.round((selected.totalPassed / selected.totalAttempted) * 100)}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mb-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Topics covered</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.topics.map((topic) => (
                    <span key={topic} className="text-xs px-2 py-1 rounded-full bg-muted border border-border text-foreground/70">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 mb-5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    This is a timed exam. Once started, the timer cannot be paused.
                    Make sure you have {Math.floor(selected.timeLimit / 60)} minutes available.
                  </p>
                </div>
              </div>

              <Button variant="gradient" className="w-full mb-2" asChild>
                <Link href={`/exams/${selected.id}`}>
                  <Play className="h-4 w-4" />
                  Start exam
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/practice?track=${selected.trackSlug}`}>
                  Practice first
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExamsPage() {
  return (
    <Suspense fallback={<div className="pt-8 container">Loading...</div>}>
      <ExamsContent />
    </Suspense>
  );
}
