"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TRAINING_TRACKS } from "@/lib/tracks";
import {
  Brain, Sparkles, Zap, Shield, BarChart3, ChevronRight,
  ArrowRight, Star, Check, Play, Trophy, TrendingUp,
  Target, Clock, Award, BookOpen, Cpu,
  CheckCircle2, XCircle, RotateCcw,
} from "lucide-react";

const STATS = [
  { label: "Practice Tasks", value: "2,400+", icon: Target },
  { label: "Training Tracks", value: "20", icon: BookOpen },
  { label: "AI Companies", value: "15+", icon: Cpu },
  { label: "Avg. Hire Rate", value: "3×", icon: TrendingUp },
];

const COMPANIES = [
  "Outlier AI", "Scale AI", "Alignerr", "DataAnnotation",
  "Appen", "Lionbridge", "Surge AI", "Handshake AI",
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Pick your training track",
    desc: "Choose from 20 specialized tracks matching the exact work done on Outlier, Scale AI, and other platforms.",
    bg: "bg-brand-600",
  },
  {
    step: "02",
    title: "Practice with real task formats",
    desc: "Complete RLHF comparisons, response evaluations, annotation tasks, and more — identical to real AI training work.",
    bg: "bg-blue-500",
  },
  {
    step: "03",
    title: "Get AI-powered scoring",
    desc: "Every task is scored instantly by AI with detailed feedback, explanations, and improvement suggestions.",
    bg: "bg-emerald-500",
  },
  {
    step: "04",
    title: "Simulate qualification exams",
    desc: "Take timed mock qualification tests that mirror the exact screening process used by AI companies.",
    bg: "bg-amber-500",
  },
];

const FEATURES = [
  {
    icon: BarChart3,
    color: "text-brand-600",
    bg: "bg-brand-50 border-brand-200",
    title: "Readiness Score",
    desc: "Track your qualification readiness score across every skill area. Know exactly when you're ready to apply.",
  },
  {
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    title: "Adaptive Difficulty",
    desc: "Tasks get harder as you improve. The AI adjusts challenge level to always keep you in the growth zone.",
  },
  {
    icon: Trophy,
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    title: "Gamified Progress",
    desc: "XP, levels, streaks, and badges make daily practice addictive. Compete on the leaderboard.",
  },
  {
    icon: Brain,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    title: "AI Tutor",
    desc: "Get personalized explanations for every mistake. Your AI mentor analyzes weaknesses and creates study plans.",
  },
  {
    icon: Shield,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    title: "Mock Qualifications",
    desc: "Timed, pass/fail qualification simulations that feel exactly like Outlier and Scale AI screening tests.",
  },
  {
    icon: Award,
    color: "text-pink-600",
    bg: "bg-pink-50 border-pink-200",
    title: "Skill Certificates",
    desc: "Earn verified certificates for each track. Show your preparation to AI companies when applying.",
  },
];

const TESTIMONIALS = [
  {
    text: "Passed the Outlier AI qualification on my first try after 2 weeks on this platform. The mock exams are almost identical.",
    name: "Sarah K.",
    role: "Outlier AI Contractor",
    rating: 5,
    track: "RLHF Ranking",
  },
  {
    text: "The RLHF ranking practice was exactly what Scale AI tested me on. Got hired and earning $30/hr now.",
    name: "Marcus T.",
    role: "Scale AI Tasker",
    rating: 5,
    track: "Response Evaluation",
  },
  {
    text: "Failed Alignerr twice before finding this. After practicing the prompt engineering track, I passed easily.",
    name: "Priya M.",
    role: "Alignerr Specialist",
    rating: 5,
    track: "Prompt Engineering",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Start practicing immediately. No credit card needed.",
    features: [
      "5 tracks (beginner)",
      "50 practice tasks/month",
      "Basic AI scoring",
      "Progress tracking",
      "2 mock exams/month",
    ],
    cta: "Start free",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    desc: "Unlimited practice. Serious preparation.",
    features: [
      "All 20 training tracks",
      "Unlimited practice tasks",
      "Advanced AI feedback",
      "Unlimited mock exams",
      "AI tutor assistant",
      "Skill certificates",
      "Priority scoring queue",
      "Leaderboard access",
    ],
    cta: "Start 7-day trial",
    href: "/register?plan=pro",
    highlight: true,
  },
  {
    name: "Teams",
    price: "$49",
    period: "/month",
    desc: "For bootcamps, agencies, and study groups.",
    features: [
      "Everything in Pro",
      "Up to 10 members",
      "Team leaderboard",
      "Progress reports",
      "Custom tracks",
      "Slack integration",
    ],
    cta: "Contact sales",
    href: "/contact",
    highlight: false,
  },
];

function DemoTask() {
  const [selected, setSelected] = useState<"a" | "b" | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 overflow-hidden shadow-card-lg">
      <div className="px-5 py-3 border-b border-ink-700 flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <span className="ml-3 text-xs text-ink-400 font-mono">RLHF Ranking — Task #47</span>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-ink-400">
          <Clock className="h-3 w-3" /> 2:34
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs text-ink-400 uppercase tracking-wider mb-1">Task</p>
        <p className="text-sm text-white/80 mb-4">
          Which AI response is more helpful and accurate? Select the better response.
        </p>
        <p className="text-xs text-ink-400 bg-white/5 rounded-lg px-3 py-2 mb-4 font-mono">
          Prompt: &quot;Explain how transformer models handle context length limitations&quot;
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { id: "a", label: "Response A", text: "Transformers use attention mechanisms but struggle with long sequences due to O(n²) complexity. Solutions include sparse attention, sliding windows, and position encoding modifications like RoPE..." },
            { id: "b", label: "Response B", text: "Transformers have a context window limit because they're limited. You can use longer models to fix this problem. Some models support more tokens than others." },
          ].map(({ id, label, text }) => (
            <button
              type="button"
              key={id}
              onClick={() => !submitted && setSelected(id as "a" | "b")}
              className={cn(
                "p-3 rounded-xl border text-left transition-all text-xs leading-relaxed",
                selected === id
                  ? "border-brand-500 bg-brand-600/10"
                  : "border-ink-700 bg-white/[0.02] hover:border-ink-500",
              )}
            >
              <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block mb-1.5">{label}</span>
              <span className="text-white/70">{text}</span>
            </button>
          ))}
        </div>
        {!submitted ? (
          <Button variant="gradient" size="sm" className="w-full" disabled={!selected} onClick={() => setSubmitted(true)}>
            Submit Answer
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-xl p-3 border",
              selected === "a" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30",
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {selected === "a" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400 shrink-0" />
              )}
              <span className={cn("text-sm font-semibold", selected === "a" ? "text-emerald-400" : "text-red-400")}>
                {selected === "a" ? "Correct! +20 XP" : "Incorrect — Response A was better"}
              </span>
            </div>
            <p className="text-xs text-white/60">
              {selected === "a"
                ? "Response A demonstrates technical depth with specific terminology (O(n²), RoPE), concrete solutions, and accurate information."
                : "Response B is vague, lacks technical specificity, and doesn't provide actionable information about the actual mechanisms."}
            </p>
            <button
              type="button"
              onClick={() => { setSelected(null); setSubmitted(false); }}
              className="mt-2 flex items-center gap-1 text-xs text-ink-400 hover:text-ink-200 transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Try again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function TrackPreviewCard({ track, index }: { track: typeof TRAINING_TRACKS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group p-4 rounded-xl border border-border bg-white hover:border-brand-300 hover:shadow-card transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{track.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{track.name}</p>
          <p className="text-xs text-muted-foreground">{track.estimatedHours}h · {"⭐".repeat(track.difficulty)}</p>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-brand-600 shrink-0 transition-colors" />
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, -80]);

  return (
    <main className="overflow-hidden">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-28 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(234,85,4,0.08),transparent)]" />
        <div className="absolute inset-0 bg-dot-grid-light" />

        <motion.div
          ref={heroRef}
          style={{ opacity: heroOpacity, y: heroY }}
          className="container relative z-10 text-center max-w-5xl"
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="gradient" className="mb-6 px-4 py-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              The #1 AI Trainer Preparation Platform
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-foreground"
          >
            Practice AI training tasks.{" "}
            <span className="gradient-text">Get hired</span> by top AI companies.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Simulate real Outlier AI, Scale AI, and Alignerr tasks before you apply.
            Practice RLHF, annotation, evaluation, and more — then ace the qualification test.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-16"
          >
            <Button variant="gradient" size="xl" className="py-4 rounded-full" asChild>
              <Link href="/register">
                Start practicing free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="py-4 rounded-full" asChild>
              <Link href="/tracks">
                <Play className="h-4 w-4" />
                View all 20 tracks
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16"
          >
            {STATS.map(({ label, value }) => (
              <div key={label} className="text-center p-4 rounded-2xl border border-border bg-white shadow-sm">
                <div className="text-2xl font-bold gradient-text mb-1">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </motion.div>

          {/* Companies */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-4">Practice for roles at</p>
            <div className="flex flex-wrap justify-center gap-3">
              {COMPANIES.map((company) => (
                <span key={company} className="px-3 py-1.5 rounded-full border border-border bg-stone-50 text-xs text-muted-foreground">
                  {company}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── INTERACTIVE DEMO ── */}
      <section className="py-32 bg-background">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Badge variant="outline" className="mb-4">Live Demo</Badge>
              <h2 className="text-4xl font-bold tracking-tight mb-4">Try a real task — right now</h2>
              <p className="text-muted-foreground mb-8">
                This is exactly what RLHF ranking tasks look like on Outlier AI and Scale AI.
                Compare two AI responses and choose the better one. Get instant AI feedback.
              </p>
              <div className="space-y-3">
                {[
                  "Identical to real qualification tasks",
                  "Instant AI scoring with explanations",
                  "Learn from every mistake",
                  "Track improvement over time",
                ].map((point) => (
                  <div key={point} className="flex items-center gap-2.5 text-sm text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    {point}
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <DemoTask />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-32 bg-stone-50">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="gradient" className="mb-4">How it works</Badge>
            <h2 className="text-4xl font-bold tracking-tight mb-4">From zero to qualified in days</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A structured path that takes you from beginner to confident AI trainer, ready to pass any qualification test.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc, bg }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-border to-transparent z-0 -translate-y-1/2" />
                )}
                <div className="relative z-10 p-6 rounded-2xl border border-border bg-white shadow-card h-full">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white font-bold text-lg", bg)}>
                    {step}
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRAINING TRACKS ── */}
      <section className="py-32 bg-background">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="lg:sticky lg:top-24">
              <Badge variant="outline" className="mb-4">20 Training Tracks</Badge>
              <h2 className="text-4xl font-bold tracking-tight mb-4">Every skill AI companies test for</h2>
              <p className="text-muted-foreground mb-8">
                Our tracks are built by reverse-engineering the qualification tests and task types from Outlier AI, Scale AI, Alignerr, and more.
              </p>
              <Button variant="gradient" size="lg" asChild>
                <Link href="/register">
                  Start with any track
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
              {TRAINING_TRACKS.map((track, i) => (
                <TrackPreviewCard key={track.slug} track={track} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-32 bg-stone-50">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="gradient" className="mb-4">Platform Features</Badge>
            <h2 className="text-4xl font-bold tracking-tight mb-4">Built for serious preparation</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to go from first practice task to passing qualification tests.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-border bg-white shadow-card hover:shadow-card-md hover:border-brand-200 transition-all"
              >
                <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center mb-4", bg)}>
                  <Icon className={cn("h-5 w-5", color)} />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-32 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <Badge variant="gradient" className="mb-4">Success Stories</Badge>
            <h2 className="text-4xl font-bold tracking-tight mb-4">They practiced here. They got hired.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ text, name, role, rating, track }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-white shadow-card"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed mb-5">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                    {track}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-32 bg-stone-50">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <Badge variant="gradient" className="mb-4">Pricing</Badge>
            <h2 className="text-4xl font-bold tracking-tight mb-4">Start free. Go unlimited when ready.</h2>
            <p className="text-muted-foreground">No credit card required for the free plan.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map(({ name, price, period, desc, features, cta, href, highlight }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "relative p-6 rounded-2xl border shadow-card",
                  highlight ? "border-brand-400 bg-white shadow-orange" : "border-border bg-white",
                )}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="gradient" className="text-xs">Most Popular</Badge>
                  </div>
                )}
                <p className="font-semibold mb-1">{name}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold">{price}</span>
                  <span className="text-muted-foreground text-sm">{period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{desc}</p>
                <ul className="space-y-2.5 mb-6">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant={highlight ? "gradient" : "outline"} className="w-full" asChild>
                  <Link href={href}>{cta}</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(234,85,4,0.08),transparent)]" />
        <div className="absolute inset-0 bg-dot-grid-light" />
        <div className="container relative z-10 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-6 shadow-orange-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
              Start practicing today.
              <br />
              <span className="gradient-text">Get hired this month.</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of AI trainers who used this platform to pass qualification tests and land contracts with top AI companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="gradient" size="xl" className="py-4 rounded-full" asChild>
                <Link href="/register">
                  Create free account
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="py-4 rounded-full" asChild>
                <Link href="/tracks">Browse tracks</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground/60">
              Free forever · No credit card · Start in 60 seconds
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
