"use client";

import { use, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Clock, ChevronRight, ChevronLeft, AlertTriangle, Trophy,
  CheckCircle2, XCircle, Brain, Zap, ArrowLeft, Target,
  RotateCcw, BookOpen,
} from "lucide-react";

// Exam definitions
const EXAM_DATA: Record<string, {
  id: string;
  title: string;
  trackName: string;
  timeLimit: number;
  passingScore: number;
  questions: Array<{
    id: string;
    type: "COMPARE" | "MCQ" | "RATE" | "LABEL";
    prompt: string;
    task: string;
    options?: string[];
    correctIndex?: number;
    responseA?: string;
    responseB?: string;
    correctChoice?: "A" | "B";
    labels?: string[];
    correctLabel?: string;
    explanation: string;
    points: number;
  }>;
}> = {
  "exam-rlhf-basic": {
    id: "exam-rlhf-basic",
    title: "RLHF Fundamentals Qualification",
    trackName: "RLHF Ranking",
    timeLimit: 1800,
    passingScore: 70,
    questions: [
      {
        id: "q1", type: "COMPARE", points: 10,
        prompt: "Which response better answers the question: 'What is the difference between supervised and unsupervised learning?'",
        task: "Select the better AI response",
        responseA: "Supervised learning uses labeled training data — the model learns from examples where the correct answer is provided. Unsupervised learning finds patterns in unlabeled data without predefined answers. For example, supervised learning classifies emails as spam/not-spam using labeled examples, while unsupervised learning groups customers by purchase behavior without pre-set categories.",
        responseB: "Supervised learning is when you supervise the learning process and unsupervised is when you don't. Both are types of machine learning that computers use to learn from data. Supervised is more controlled and unsupervised is more free. They are both used in AI and data science.",
        correctChoice: "A",
        explanation: "Response A correctly defines both concepts with specific examples, accurate terminology, and a concrete comparison. Response B is vague, circular (defines supervision by 'supervising'), and adds no real information.",
      },
      {
        id: "q2", type: "MCQ", points: 10,
        prompt: "An AI response gives a detailed, technically accurate answer to a coding question but uses condescending language like 'This is a basic question you should know.' How should you rank this response?",
        task: "Select the best evaluation",
        options: [
          "High quality — technical accuracy is what matters",
          "Medium quality — technically correct but tone is inappropriate",
          "Low quality — tone violations make technical content worthless",
          "Perfect — directness is valuable in technical content",
        ],
        correctIndex: 1,
        explanation: "AI responses must be both technically accurate AND appropriately toned. Condescending language is a quality flaw even in a technically correct response. It would receive medium marks — accurate information, poor delivery.",
      },
      {
        id: "q3", type: "COMPARE", points: 10,
        prompt: "User asks: 'Is it safe to mix bleach and ammonia?' — Which response is better?",
        task: "Select the safer, more helpful response",
        responseA: "No, never mix bleach and ammonia. This creates chloramine gas, which is toxic and can cause serious respiratory damage, eye irritation, and can be fatal in enclosed spaces. Always store and use these chemicals separately, ensure good ventilation, and if accidental mixing occurs, leave the area immediately and get fresh air.",
        responseB: "I can't provide information about mixing chemicals. Please consult a professional.",
        correctChoice: "A",
        explanation: "Response A is better — it directly answers a genuine safety question with accurate, actionable information that protects the user. Response B incorrectly refuses a legitimate safety inquiry. Refusing to answer straightforward safety questions is harmful, not helpful.",
      },
      {
        id: "q4", type: "MCQ", points: 10,
        prompt: "You're comparing two responses. Response A is 800 words and very comprehensive. Response B is 150 words and concise but covers all key points. The user asked for a 'brief overview'. Which do you prefer?",
        task: "Select the correct preference",
        options: [
          "Response A — more information is always better",
          "Response B — it best matches the user's stated request",
          "Response A — comprehensiveness shows effort",
          "Both are equal — length doesn't matter",
        ],
        correctIndex: 1,
        explanation: "Response length should match user intent. When a user asks for a 'brief overview', a concise, accurate response is higher quality than an unnecessarily verbose one. Following instructions is a core quality dimension.",
      },
      {
        id: "q5", type: "COMPARE", points: 10,
        prompt: "Compare responses to: 'Explain how to calculate compound interest'",
        task: "Select the better response",
        responseA: "Compound interest formula: A = P(1 + r/n)^(nt), where A = final amount, P = principal, r = annual rate (decimal), n = compounds per year, t = years. Example: $1,000 at 5% compounded monthly for 3 years: A = 1000(1 + 0.05/12)^(12×3) = $1,161.62.",
        responseB: "Compound interest is interest on interest. To calculate it you use a formula with the principal amount and the interest rate and the time period. You multiply these together and get the final amount. It's different from simple interest which is simpler.",
        correctChoice: "A",
        explanation: "Response A provides the actual formula with variable definitions and a worked example — exactly what's needed. Response B describes compound interest vaguely without providing the formula or any useful calculation method.",
      },
    ],
  },
};

const DEFAULT_EXAM = EXAM_DATA["exam-rlhf-basic"];

type Phase = "intro" | "exam" | "results";

export default function ExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = use(params);
  const exam = EXAM_DATA[examId] ?? DEFAULT_EXAM;

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [timeLeft, setTimeLeft] = useState(exam.timeLimit);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== "exam") return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setPhase("results");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [phase]);

  const q = exam.questions[currentQ];
  const totalQ = exam.questions.length;
  const answered = Object.keys(answers).length;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeWarning = timeLeft < 300 && phase === "exam";
  const progress = ((currentQ + 1) / totalQ) * 100;

  // Calculate score
  const score = exam.questions.reduce((total, q) => {
    const ans = answers[q.id];
    if (q.type === "COMPARE" && ans === q.correctChoice) return total + q.points;
    if (q.type === "MCQ" && ans === q.correctIndex) return total + q.points;
    return total;
  }, 0);
  const maxScore = exam.questions.reduce((t, q) => t + q.points, 0);
  const pct = Math.round((score / maxScore) * 100);
  const passed = pct >= exam.passingScore;

  const handleAnswer = (value: string | number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  };

  const handleNext = () => {
    if (currentQ < totalQ - 1) {
      setCurrentQ((c) => c + 1);
    } else {
      clearInterval(intervalRef.current!);
      setPhase("results");
    }
  };

  // ── Intro ────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="pt-8 pb-16">
        <div className="container max-w-2xl">
          <Link href="/exams" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to exams
          </Link>
          <div className="p-8 rounded-3xl border border-border/50 bg-card/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-ink-900 flex items-center justify-center">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <div>
                <Badge variant="gradient" className="mb-1">Qualification Exam</Badge>
                <h1 className="text-2xl font-bold">{exam.title}</h1>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: Clock, label: "Time limit", value: `${Math.floor(exam.timeLimit / 60)} minutes` },
                { icon: Target, label: "Questions", value: `${totalQ} tasks` },
                { icon: Trophy, label: "Pass score", value: `${exam.passingScore}%` },
                { icon: Brain, label: "Track", value: exam.trackName },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-3 rounded-xl border border-border/50 bg-card/30">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </div>
                  <p className="font-semibold text-sm">{value}</p>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-300/80">
                  Once started, the timer cannot be paused. Ensure you have {Math.floor(exam.timeLimit / 60)} uninterrupted minutes.
                </p>
              </div>
            </div>
            <Button variant="gradient" size="lg" className="w-full" onClick={() => setPhase("exam")}>
              Start exam — {Math.floor(exam.timeLimit / 60)} minutes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Results ──────────────────────────────────────────────────────────────
  if (phase === "results") {
    return (
      <div className="pt-8 pb-16">
        <div className="container max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Score card */}
            <div className={cn(
              "p-8 rounded-3xl border mb-6 text-center",
              passed ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5",
            )}>
              <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-bold",
                passed ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                {passed ? "✓" : "✗"}
              </div>
              <h1 className={cn("text-3xl font-bold mb-1", passed ? "text-emerald-400" : "text-red-400")}>
                {passed ? "Passed!" : "Not yet"}
              </h1>
              <div className="text-5xl font-bold my-3">{pct}%</div>
              <p className="text-muted-foreground text-sm mb-4">
                {score}/{maxScore} points · Passing score: {exam.passingScore}%
              </p>
              <Badge variant={passed ? "default" : "destructive"} className="text-sm px-4 py-1">
                {passed ? "Qualification passed" : `Need ${exam.passingScore - pct}% more to pass`}
              </Badge>
            </div>

            {/* Question review */}
            <h2 className="font-bold text-lg mb-4">Answer review</h2>
            <div className="space-y-3 mb-8">
              {exam.questions.map((question, i) => {
                const ans = answers[question.id];
                const correct = question.type === "COMPARE"
                  ? ans === question.correctChoice
                  : ans === question.correctIndex;
                return (
                  <div key={question.id} className={cn(
                    "p-4 rounded-xl border",
                    correct ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5",
                  )}>
                    <div className="flex items-start gap-3">
                      {correct
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        : <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />}
                      <div>
                        <p className="text-sm font-medium mb-1">Q{i + 1}: {question.prompt.slice(0, 80)}...</p>
                        <p className="text-xs text-muted-foreground">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/practice"><BookOpen className="h-4 w-4" /> Keep practicing</Link>
              </Button>
              {!passed && (
                <Button variant="gradient" className="flex-1" onClick={() => {
                  setAnswers({});
                  setCurrentQ(0);
                  setTimeLeft(exam.timeLimit);
                  setPhase("intro");
                }}>
                  <RotateCcw className="h-4 w-4" /> Retry exam
                </Button>
              )}
              {passed && (
                <Button variant="gradient" className="flex-1" asChild>
                  <Link href="/exams"><Trophy className="h-4 w-4" /> Next exam</Link>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Exam ─────────────────────────────────────────────────────────────────
  return (
    <div className="pt-8 pb-16">
      <div className="container max-w-3xl">
        {/* Timer bar */}
        <div className={cn(
          "sticky top-16 z-20 flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl border mb-6 backdrop-blur-xl transition-colors",
          timeWarning ? "border-red-500/40 bg-red-500/10" : "border-border/50 bg-card/90",
        )}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{currentQ + 1} / {totalQ}</span>
            <div className="w-32 sm:w-48">
              <Progress value={progress} className="h-1.5" />
            </div>
            <span className="text-xs text-muted-foreground">{answered} answered</span>
          </div>
          <span className={cn(
            "flex items-center gap-1.5 text-sm font-mono font-bold",
            timeWarning ? "text-red-400 animate-pulse" : "text-foreground",
          )}>
            <Clock className="h-4 w-4" />
            {mins}:{secs.toString().padStart(2, "0")}
          </span>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                Q{currentQ + 1}
              </span>
              <span className="text-xs text-muted-foreground">{q.points} pts</span>
            </div>

            <h2 className="text-xl font-semibold leading-snug">{q.prompt}</h2>
            <p className="text-sm text-muted-foreground">{q.task}</p>

            {/* COMPARE task */}
            {q.type === "COMPARE" && (
              <div className="grid md:grid-cols-2 gap-4">
                {(["A", "B"] as const).map((label) => (
                  <button
                    type="button"
                    key={label}
                    onClick={() => handleAnswer(label)}
                    className={cn(
                      "p-4 rounded-xl border text-left text-sm leading-relaxed transition-all",
                      answers[q.id] === label
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border bg-card/50 hover:border-primary/40",
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Response {label}</span>
                      {answers[q.id] === label && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-foreground/80">{label === "A" ? q.responseA : q.responseB}</p>
                  </button>
                ))}
              </div>
            )}

            {/* MCQ task */}
            {q.type === "MCQ" && (
              <div className="space-y-2.5">
                {q.options?.map((opt, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left text-sm transition-all flex items-center gap-3",
                      answers[q.id] === i
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card/50 hover:border-primary/40",
                    )}
                  >
                    <span className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0",
                      answers[q.id] === i ? "border-primary bg-primary text-primary-foreground" : "border-border",
                    )}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
            disabled={currentQ === 0}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button
            variant="gradient"
            onClick={handleNext}
            disabled={!answers[q.id] && answers[q.id] !== 0}
          >
            {currentQ < totalQ - 1 ? (
              <><span>Next</span><ChevronRight className="h-4 w-4" /></>
            ) : (
              <><span>Submit exam</span><Trophy className="h-4 w-4" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
