"use client";

import { use, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Clock, Zap, CheckCircle2, XCircle, ChevronRight,
  ThumbsUp, ThumbsDown, Lightbulb, RotateCcw, Trophy,
  Star, MessageSquare, AlertTriangle, Sparkles, Brain,
  ChevronUp, ChevronDown,
} from "lucide-react";

// ── Static task content library ──────────────────────────────────────────────

const TASKS: Record<string, TaskData> = {
  "task-001": {
    id: "task-001",
    trackSlug: "rlhf-ranking",
    trackName: "RLHF Ranking",
    trackIcon: "⚖️",
    title: "Compare AI explanations of quantum entanglement",
    instructions: "Read both AI responses carefully. Select the response that better explains quantum entanglement — considering accuracy, clarity, depth, and helpfulness.",
    taskType: "COMPARE_RESPONSES",
    difficulty: 2,
    xpReward: 20,
    timeLimit: 300,
    prompt: "Explain quantum entanglement in a way that a high school student could understand.",
    content: {
      responseA: "Quantum entanglement is when two particles become connected in such a way that the state of one instantly affects the other, no matter how far apart they are. Imagine two coins that always land on opposite sides — when you flip one and get heads, the other is always tails, even if it's on the other side of the universe. This happens because their quantum states are 'entangled' — mathematically described as a superposition that collapses together when measured. Einstein famously called this 'spooky action at a distance' because it seemed to violate the speed of light, but no information actually travels — the correlation exists from the moment of entanglement.",
      responseB: "Quantum entanglement is a quantum mechanics thing where particles are connected. When you measure one particle it affects the other one even if they are far away. Scientists use this for quantum computers and quantum cryptography. It's really complicated and hard to understand but basically the particles are linked together. This was discovered by Einstein and other scientists and it's very important for the future of technology.",
      correctAnswer: "A",
      explanation: "Response A is significantly better because it: (1) uses an effective analogy (coins) that a high schooler can grasp, (2) accurately references the physics (superposition, collapse), (3) addresses Einstein's 'spooky action' criticism and correctly clarifies why it doesn't violate relativity, and (4) is well-structured with logical flow. Response B is vague, contains an error (Einstein didn't discover entanglement — he was skeptical of it), lacks concrete explanation, and doesn't actually help the student understand the phenomenon.",
    },
    hints: [
      "Look for accuracy: does the response contain any factual errors?",
      "Consider the analogy: does it help a high schooler actually understand?",
      "Check if the response addresses Einstein's concern correctly",
    ],
  },
  "task-002": {
    id: "task-002",
    trackSlug: "response-evaluation",
    trackName: "AI Response Evaluation",
    trackIcon: "🔍",
    title: "Rate the helpfulness of a customer support response",
    instructions: "Use the scoring rubric to rate this AI-generated customer support response. Consider all four dimensions and provide a final overall score.",
    taskType: "RATE_QUALITY",
    difficulty: 1,
    xpReward: 15,
    timeLimit: 180,
    prompt: "User: My order hasn't arrived and it's been 2 weeks. My tracking shows 'in transit' but nothing has changed in 10 days.",
    content: {
      response: "Thank you for reaching out! I understand how frustrating it must be to wait for your order. I can see your tracking number shows 'in transit' with no updates for 10 days, which is unusual. Here's what I'll do: I'm escalating your case to our shipping team immediately and will have an update for you within 24 hours. In the meantime, I've added a $10 store credit to your account for the inconvenience. If the package isn't resolved within 72 hours, I'll process a full replacement or refund — your choice. Is there anything else I can help you with?",
      rubric: [
        { dimension: "Helpfulness", desc: "Does it solve or meaningfully address the problem?", weight: 30 },
        { dimension: "Tone & Empathy", desc: "Is the response warm, professional, and understanding?", weight: 25 },
        { dimension: "Clarity", desc: "Is the response clear and easy to understand?", weight: 25 },
        { dimension: "Completeness", desc: "Does it cover all aspects of the issue?", weight: 20 },
      ],
      modelAnswer: { helpfulness: 5, tone: 5, clarity: 4, completeness: 4, overall: 4.7 },
      explanation: "This response is excellent (4.5–5/5 range). It acknowledges the frustration, takes clear action (escalation), provides a specific timeline (24 hours), offers immediate compensation ($10), gives a clear resolution path (72 hours → replacement/refund), and ends professionally. Minor deduction for completeness: it could have asked the user to confirm their address is correct in case of delivery issues.",
    },
    hints: [
      "Focus on whether the AI actually commits to a solution, not just acknowledges the problem",
      "Does the response give the customer a timeline and clear next steps?",
      "Consider: does this response make the customer feel heard and helped?",
    ],
  },
  "task-003": {
    id: "task-003",
    trackSlug: "prompt-engineering",
    trackName: "Prompt Engineering",
    trackIcon: "✍️",
    title: "Improve a vague prompt to get a specific code output",
    instructions: "The original prompt is too vague and produces inconsistent AI outputs. Rewrite it to be specific, unambiguous, and likely to produce exactly the desired output every time.",
    taskType: "PROMPT_ENGINEERING",
    difficulty: 3,
    xpReward: 30,
    timeLimit: 600,
    prompt: "Write a function to sort stuff",
    content: {
      problem: "This prompt is too vague — it doesn't specify language, data type, sort algorithm, parameter names, return type, or edge cases. AI models will produce wildly different outputs.",
      badOutput: "Here's a sort function:\ndef sort(lst):\n    return sorted(lst)\n\nOr in JavaScript:\nfunction sort(arr) { return arr.sort(); }",
      targetOutput: "A Python function named `sort_products` that accepts a list of product dictionaries with 'name' and 'price' keys, sorts by price ascending (with name as tiebreaker), handles empty lists, and includes type hints and a docstring.",
      modelAnswer: "Write a Python function called `sort_products` that:\n- Accepts a parameter `products: list[dict]` where each dict has keys 'name' (str) and 'price' (float)\n- Returns a new list sorted by 'price' ascending; use 'name' alphabetically as a tiebreaker\n- Handles an empty list by returning an empty list\n- Includes a docstring explaining the function\n- Uses type hints throughout\n- Do not use any external libraries",
      explanation: "An effective improved prompt specifies: (1) exact function name, (2) parameter types and structure, (3) sort key and direction, (4) tiebreaker logic, (5) edge case handling, (6) code style requirements, and (7) constraints. The more specific you are, the more consistent and useful the AI output will be.",
    },
    hints: [
      "Think about: what programming language? What data type? What output format?",
      "Specify the exact function name, parameter names, and return type",
      "What edge cases should the function handle?",
    ],
  },
  "task-007": {
    id: "task-007",
    trackSlug: "sentiment-classification",
    trackName: "Sentiment Classification",
    trackIcon: "💭",
    title: "Label the emotional tone of product reviews",
    instructions: "Classify each product review with the most appropriate sentiment label. Consider the overall tone, not just individual words.",
    taskType: "SENTIMENT_LABEL",
    difficulty: 1,
    xpReward: 10,
    timeLimit: 120,
    prompt: "Label each review: Positive, Negative, Neutral, or Mixed",
    content: {
      items: [
        { text: "The packaging was nice but the product itself stopped working after 3 days. Very disappointed.", id: "r1", answer: "Negative" },
        { text: "Does exactly what it says. No complaints.", id: "r2", answer: "Neutral" },
        { text: "Absolutely love this! Best purchase I've made all year. Fast shipping too!", id: "r3", answer: "Positive" },
        { text: "Quality is great but the price is way too high for what you get.", id: "r4", answer: "Mixed" },
        { text: "Arrived broken. Customer service was helpful and sent a replacement quickly.", id: "r5", answer: "Mixed" },
      ],
      explanation: "Key distinctions: 'Negative' = overall negative experience despite any minor positives. 'Mixed' = genuine significant positives AND negatives. 'Neutral' = factual, no strong emotion. The hardest cases are reviews with a negative core (broken product) but positive resolution (good service) — these are Mixed because both experiences are significant.",
    },
    hints: [
      "Look at the overall emotional experience, not just the last sentence",
      "'Mixed' means genuinely significant positives AND negatives in the same review",
      "Watch out for sarcasm — negative statements phrased positively",
    ],
  },
};

interface TaskData {
  id: string;
  trackSlug: string;
  trackName: string;
  trackIcon: string;
  title: string;
  instructions: string;
  taskType: string;
  difficulty: number;
  xpReward: number;
  timeLimit: number;
  prompt: string;
  content: Record<string, unknown>;
  hints: string[];
}

// ── Task renderers ─────────────────────────────────────────────────────────

function CompareTask({ content, onSubmit }: { content: Record<string, unknown>; onSubmit: (a: unknown) => void }) {
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const [justification, setJustification] = useState("");

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {(["A", "B"] as const).map((label) => (
          <button
            type="button"
            key={label}
            onClick={() => setSelected(label)}
            className={cn(
              "p-4 rounded-xl border text-left transition-all text-sm leading-relaxed h-full",
              selected === label
                ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                : "border-border bg-card/50 hover:border-primary/40",
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Response {label}</span>
              {selected === label && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </div>
            <p className="text-foreground/80">{content[`response${label}`] as string}</p>
          </button>
        ))}
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">
          Briefly explain your choice (optional but encouraged)
        </label>
        <textarea
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          placeholder="Response A is better because..."
          className="w-full h-20 px-3 py-2 rounded-xl border border-border bg-card/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <Button
        variant="gradient"
        className="w-full"
        disabled={!selected}
        onClick={() => onSubmit({ choice: selected, justification })}
      >
        Submit Answer
      </Button>
    </div>
  );
}

function RateQualityTask({ content, onSubmit }: { content: Record<string, unknown>; onSubmit: (a: unknown) => void }) {
  const rubric = content.rubric as Array<{ dimension: string; desc: string; weight: number }>;
  const [scores, setScores] = useState<Record<string, number>>({});

  const allScored = rubric?.every((r) => scores[r.dimension] !== undefined);
  const overall = allScored
    ? (rubric.reduce((s, r) => s + (scores[r.dimension] * r.weight) / 100, 0)).toFixed(1)
    : null;

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-border bg-card/50">
        <p className="text-xs text-muted-foreground mb-1">AI Response to evaluate</p>
        <p className="text-sm leading-relaxed text-foreground/80">{content.response as string}</p>
      </div>
      <div className="space-y-3">
        {rubric?.map((r) => (
          <div key={r.dimension} className="p-3 rounded-xl border border-border bg-card/30">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="text-sm font-medium">{r.dimension}</span>
                <span className="text-xs text-muted-foreground ml-2">({r.weight}% weight)</span>
              </div>
              {scores[r.dimension] && (
                <span className="text-sm font-bold text-primary">{scores[r.dimension]}/5</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">{r.desc}</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setScores((prev) => ({ ...prev, [r.dimension]: n }))}
                  className={cn(
                    "w-9 h-9 rounded-lg border text-sm font-semibold transition-all",
                    scores[r.dimension] === n
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card/50 hover:border-primary/50",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {overall && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20">
          <span className="text-sm font-medium">Weighted overall score</span>
          <span className="text-lg font-bold text-primary">{overall} / 5</span>
        </div>
      )}
      <Button
        variant="gradient"
        className="w-full"
        disabled={!allScored}
        onClick={() => onSubmit({ scores, overall: parseFloat(overall ?? "0") })}
      >
        Submit Scores
      </Button>
    </div>
  );
}

function SentimentTask({ content, onSubmit }: { content: Record<string, unknown>; onSubmit: (a: unknown) => void }) {
  const items = content.items as Array<{ text: string; id: string; answer: string }>;
  const options = ["Positive", "Negative", "Neutral", "Mixed"];
  const [labels, setLabels] = useState<Record<string, string>>({});

  const allLabeled = items?.every((item) => labels[item.id]);

  return (
    <div className="space-y-3">
      {items?.map((item, i) => (
        <div key={item.id} className="p-4 rounded-xl border border-border bg-card/30">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-xs font-mono text-muted-foreground mt-0.5 shrink-0">#{i + 1}</span>
            <p className="text-sm text-foreground/80 leading-relaxed">&ldquo;{item.text}&rdquo;</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {options.map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => setLabels((prev) => ({ ...prev, [item.id]: opt }))}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                  labels[item.id] === opt
                    ? opt === "Positive" ? "bg-emerald-500 text-white border-emerald-500"
                      : opt === "Negative" ? "bg-red-500 text-white border-red-500"
                      : opt === "Mixed" ? "bg-amber-500 text-white border-amber-500"
                      : "bg-slate-500 text-white border-slate-500"
                    : "border-border text-muted-foreground hover:border-primary/50",
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      <Button
        variant="gradient"
        className="w-full"
        disabled={!allLabeled}
        onClick={() => onSubmit({ labels })}
      >
        Submit Labels
      </Button>
    </div>
  );
}

function PromptEngineeringTask({ content, onSubmit }: { content: Record<string, unknown>; onSubmit: (a: unknown) => void }) {
  const [improved, setImproved] = useState("");

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">❌ Original (vague) prompt</p>
          <p className="text-sm font-mono text-foreground/70">{content.problem as string}</p>
          <div className="mt-3 p-2 rounded-lg bg-black/20">
            <p className="text-xs text-muted-foreground mb-1">Example AI output (inconsistent):</p>
            <pre className="text-xs text-white/50 whitespace-pre-wrap">{content.badOutput as string}</pre>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">✅ Target output</p>
          <p className="text-sm text-foreground/70 leading-relaxed">{content.targetOutput as string}</p>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Write your improved prompt</label>
        <textarea
          value={improved}
          onChange={(e) => setImproved(e.target.value)}
          placeholder="Write a Python function called sort_products that..."
          className="w-full h-32 px-3 py-2 rounded-xl border border-border bg-card/50 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <p className="text-xs text-muted-foreground mt-1">{improved.length} characters · aim for 100–300</p>
      </div>
      <Button
        variant="gradient"
        className="w-full"
        disabled={improved.trim().length < 20}
        onClick={() => onSubmit({ improvedPrompt: improved })}
      >
        Submit Prompt
      </Button>
    </div>
  );
}

// ── Feedback panel ─────────────────────────────────────────────────────────

function FeedbackPanel({
  task,
  answer,
  timeSpent,
  onRetry,
  onNext,
}: {
  task: TaskData;
  answer: unknown;
  timeSpent: number;
  onRetry: () => void;
  onNext: () => void;
}) {
  const [result, setResult] = useState<{
    score: number;
    correct: boolean;
    feedback: string;
    explanation: string;
    xpEarned: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      // Determine correctness based on task type
      let score = 0;
      let correct = false;
      const content = task.content;

      if (task.taskType === "COMPARE_RESPONSES") {
        const a = answer as { choice: string };
        correct = a.choice === content.correctAnswer;
        score = correct ? 90 + Math.floor(Math.random() * 10) : 30 + Math.floor(Math.random() * 30);
      } else if (task.taskType === "RATE_QUALITY") {
        const a = answer as { overall: number };
        const model = (content.modelAnswer as { overall: number }).overall;
        const diff = Math.abs(a.overall - model);
        correct = diff <= 0.5;
        score = Math.max(40, 100 - diff * 25);
      } else if (task.taskType === "SENTIMENT_LABEL") {
        const a = answer as { labels: Record<string, string> };
        const items = content.items as Array<{ id: string; answer: string }>;
        const correct_count = items.filter((i) => a.labels[i.id] === i.answer).length;
        score = Math.round((correct_count / items.length) * 100);
        correct = score >= 80;
      } else {
        score = 65 + Math.floor(Math.random() * 30);
        correct = score >= 70;
      }

      const xpEarned = correct ? task.xpReward : Math.floor(task.xpReward * 0.3);

      // Persist attempt (fire-and-forget)
      fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, answer, score, timeSpent, xpEarned, correct }),
      }).catch(() => null);

      setResult({
        score,
        correct,
        feedback: correct
          ? "Great work! Your answer demonstrates solid understanding of this task type."
          : "Good attempt! Review the explanation to improve your approach.",
        explanation: (content.explanation ?? content.modelAnswer ?? "See the correct answer above.") as string,
        xpEarned,
      });
      setLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, [task, answer, timeSpent]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <Brain className="absolute inset-0 m-auto h-7 w-7 text-primary" />
        </div>
        <p className="text-muted-foreground text-sm">AI is evaluating your answer...</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Score header */}
      <div className={cn(
        "p-5 rounded-2xl border",
        result.correct
          ? "bg-emerald-500/10 border-emerald-500/30"
          : result.score >= 50
          ? "bg-amber-500/10 border-amber-500/30"
          : "bg-red-500/10 border-red-500/30",
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {result.correct
              ? <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              : result.score >= 50
              ? <AlertTriangle className="h-6 w-6 text-amber-400" />
              : <XCircle className="h-6 w-6 text-red-400" />}
            <span className={cn("text-lg font-bold",
              result.correct ? "text-emerald-400" : result.score >= 50 ? "text-amber-400" : "text-red-400")}>
              {result.correct ? "Correct!" : result.score >= 50 ? "Partially correct" : "Incorrect"}
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{Math.round(result.score)}<span className="text-sm text-muted-foreground">/100</span></div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <Zap className="h-3 w-3 text-yellow-400" /> +{result.xpEarned} XP earned
            </div>
          </div>
        </div>
        <p className="text-sm text-foreground/80">{result.feedback}</p>
      </div>

      {/* Explanation */}
      <div className="p-4 rounded-xl border border-border bg-card/30">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold">Explanation</span>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">{result.explanation}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onRetry}>
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
        <Button variant="gradient" className="flex-1" onClick={onNext}>
          Next task
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function PracticeTaskPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = use(params);
  const task = TASKS[taskId] ?? TASKS["task-001"];

  const [phase, setPhase] = useState<"task" | "feedback">("task");
  const [answer, setAnswer] = useState<unknown>(null);
  const [timeLeft, setTimeLeft] = useState(task.timeLimit);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== "task") return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return t - 1;
      });
      setTimeSpent((s) => s + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [phase]);

  const handleSubmit = (a: unknown) => {
    clearInterval(intervalRef.current!);
    setAnswer(a);
    setPhase("feedback");
  };

  const handleRetry = () => {
    setAnswer(null);
    setTimeLeft(task.timeLimit);
    setTimeSpent(0);
    setPhase("task");
    setShowHints(false);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeWarning = timeLeft < 60 && phase === "task";

  const DIFF_LABELS = ["", "Beginner", "Easy", "Medium", "Hard", "Expert"];
  const DIFF_COLORS = ["", "text-emerald-400", "text-blue-400", "text-yellow-400", "text-orange-400", "text-red-400"];

  return (
    <div className="pt-8 pb-16">
      <div className="container max-w-3xl">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/practice" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to practice
          </Link>
          <div className="flex items-center gap-2">
            <span className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-mono font-semibold transition-colors",
              timeWarning ? "border-red-500/40 bg-red-500/10 text-red-400" : "border-border bg-card text-foreground",
            )}>
              <Clock className={cn("h-3.5 w-3.5", timeWarning && "animate-pulse")} />
              {mins}:{secs.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Track badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">{task.trackIcon}</span>
          <Badge variant="outline">{task.trackName}</Badge>
          <span className={cn("text-xs font-medium", DIFF_COLORS[task.difficulty])}>
            {DIFF_LABELS[task.difficulty]}
          </span>
          <div className="ml-auto flex items-center gap-1 text-xs text-yellow-400">
            <Zap className="h-3.5 w-3.5" /> +{task.xpReward} XP
          </div>
        </div>

        {/* Title & instructions */}
        <h1 className="text-2xl font-bold tracking-tight mb-2">{task.title}</h1>

        <div className="p-4 rounded-xl border border-border/50 bg-card/30 mb-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Task instructions</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{task.instructions}</p>
        </div>

        {/* Prompt */}
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 mb-6">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">User Prompt</p>
          <p className="text-sm font-mono text-foreground/80">{task.prompt}</p>
        </div>

        {/* Task content */}
        <AnimatePresence mode="wait">
          {phase === "task" ? (
            <motion.div key="task" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {task.taskType === "COMPARE_RESPONSES" && (
                <CompareTask content={task.content} onSubmit={handleSubmit} />
              )}
              {task.taskType === "RATE_QUALITY" && (
                <RateQualityTask content={task.content} onSubmit={handleSubmit} />
              )}
              {task.taskType === "SENTIMENT_LABEL" && (
                <SentimentTask content={task.content} onSubmit={handleSubmit} />
              )}
              {task.taskType === "PROMPT_ENGINEERING" && (
                <PromptEngineeringTask content={task.content} onSubmit={handleSubmit} />
              )}
            </motion.div>
          ) : (
            <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <FeedbackPanel
                task={task}
                answer={answer}
                timeSpent={timeSpent}
                onRetry={handleRetry}
                onNext={() => window.location.href = "/practice"}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hints */}
        {phase === "task" && task.hints.length > 0 && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowHints((v) => !v)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Lightbulb className="h-4 w-4 text-amber-400" />
              {showHints ? "Hide hints" : "Show hints"}
              {showHints ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            <AnimatePresence>
              {showHints && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
                  {task.hints.map((hint, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-amber-400 mt-0.5">•</span>
                      {hint}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
