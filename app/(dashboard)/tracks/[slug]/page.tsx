"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TRAINING_TRACKS, TRACK_COLOR_MAP, getTrack } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Clock, Star, CheckCircle2, Lock, Play,
  Trophy, Target, Zap, Brain, ChevronRight, Award,
  BarChart3, BookOpen, Sparkles,
} from "lucide-react";

const DIFFICULTY_LABELS = ["", "Beginner", "Easy", "Intermediate", "Advanced", "Expert"];

const TASK_TYPES_BY_TRACK: Record<string, { icon: string; label: string; count: number; desc: string }[]> = {
  "rlhf-ranking": [
    { icon: "⚖️", label: "Side-by-Side Comparisons", count: 40, desc: "Compare two AI responses and pick the better one" },
    { icon: "📊", label: "Multi-Response Ranking", count: 25, desc: "Rank 3-5 responses from best to worst" },
    { icon: "✍️", label: "Preference Justification", count: 20, desc: "Explain why one response is better" },
    { icon: "🎯", label: "Dimension Scoring", count: 15, desc: "Score responses on specific criteria" },
  ],
  "response-evaluation": [
    { icon: "⭐", label: "Quality Rating", count: 50, desc: "Rate AI responses on a 1-5 scale with rubric" },
    { icon: "🔍", label: "Issue Identification", count: 35, desc: "Find specific problems in AI output" },
    { icon: "📝", label: "Detailed Critique", count: 25, desc: "Write structured feedback on responses" },
    { icon: "✅", label: "Pass/Fail Evaluation", count: 30, desc: "Binary quality judgments with justification" },
  ],
  "prompt-engineering": [
    { icon: "✍️", label: "Prompt Writing", count: 45, desc: "Write prompts that produce specific outputs" },
    { icon: "🔧", label: "Prompt Refinement", count: 30, desc: "Improve weak prompts to get better results" },
    { icon: "🎯", label: "Instruction Clarity", count: 25, desc: "Make instructions more precise" },
    { icon: "🧪", label: "Edge Case Testing", count: 20, desc: "Write prompts to test AI limitations" },
  ],
};

const DEFAULT_TASK_TYPES = [
  { icon: "🎯", label: "Core Practice Tasks", count: 40, desc: "Foundational exercises for this track" },
  { icon: "⚡", label: "Speed Challenges", count: 20, desc: "Timed tasks to build efficiency" },
  { icon: "🏆", label: "Advanced Scenarios", count: 25, desc: "Complex real-world simulations" },
  { icon: "📋", label: "Qualification Prep", count: 15, desc: "Exam-style assessment tasks" },
];

export default function TrackDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const track = getTrack(slug);
  const { data: session } = useSession();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (session) {
      fetch(`/api/tracks/${slug}/progress`)
        .then((r) => r.ok ? r.json() : null)
        .then((d) => { if (d?.masteryLevel) setProgress(d.masteryLevel); })
        .catch(() => {});
    }
  }, [slug, session]);

  if (!track) notFound();

  const colors = TRACK_COLOR_MAP[track.color] ?? TRACK_COLOR_MAP.violet;
  const taskTypes = TASK_TYPES_BY_TRACK[slug] ?? DEFAULT_TASK_TYPES;
  const totalTasks = taskTypes.reduce((s, t) => s + t.count, 0);
  const otherTracks = TRAINING_TRACKS.filter((t) => t.slug !== slug).slice(0, 4);

  return (
    <div className="pt-8 pb-16">
      <div className="container max-w-5xl">
        {/* Back */}
        <Link href="/tracks" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          All tracks
        </Link>

        {/* Hero */}
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl", colors.bg, colors.border)}>
                {track.icon}
              </div>
              <div>
                <Badge variant="outline" className="mb-1 text-xs">
                  {DIFFICULTY_LABELS[track.difficulty]} · {track.estimatedHours}h
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight">{track.name}</h1>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">{track.longDesc}</p>

            {/* Skills */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Skills you&apos;ll develop</p>
              <div className="flex flex-wrap gap-2">
                {track.skills.map((skill) => (
                  <span key={skill} className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", colors.badge, colors.border)}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Companies */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Prepares you for</p>
              <div className="flex flex-wrap gap-2">
                {track.companies.map((company) => (
                  <span key={company} className="text-xs px-2.5 py-1 rounded-full border border-border bg-card text-foreground/70">
                    {company}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar card */}
          <div className="p-5 rounded-2xl border border-border/50 bg-card/40 h-fit space-y-4">
            {session && progress > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Your progress</span>
                  <span className={cn("font-semibold", colors.text)}>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            <div className="space-y-2 text-sm">
              {[
                { icon: Target, label: "Practice tasks", value: `${totalTasks}+` },
                { icon: Clock, label: "Est. time", value: `${track.estimatedHours}h` },
                { icon: Trophy, label: "XP reward", value: `${track.estimatedHours * 100}+` },
                { icon: Award, label: "Certificate", value: "Yes, on completion" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </span>
                  <span className="font-medium text-sm">{value}</span>
                </div>
              ))}
            </div>
            <Button variant="gradient" className="w-full" asChild>
              <Link href={session ? `/practice?track=${slug}` : "/register"}>
                <Play className="h-4 w-4" />
                {session ? "Start practicing" : "Sign up to start"}
              </Link>
            </Button>
            {session && (
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/exams?track=${slug}`}>
                  <Trophy className="h-4 w-4" />
                  Take qualification exam
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Task types */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-5">What you&apos;ll practice</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {taskTypes.map(({ icon, label, count, desc }) => (
              <div key={label} className="flex gap-4 p-4 rounded-xl border border-border/50 bg-card/30 hover:border-border transition-colors">
                <span className="text-2xl mt-0.5">{icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{label}</p>
                    <Badge variant="outline" className="text-[10px] py-0">{count} tasks</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What to expect */}
        <div className="mb-12 p-6 rounded-2xl border border-border/50 bg-card/30">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-powered learning
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: Brain, title: "Instant AI scoring", desc: "Every submission is scored by AI in seconds with detailed explanations." },
              { icon: BarChart3, title: "Progress tracking", desc: "See your skill improvement over time with analytics and trend graphs." },
              { icon: BookOpen, title: "Adaptive difficulty", desc: "Tasks get progressively harder as your scores improve." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3">
                <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5", colors.bg, colors.border)}>
                  <Icon className={cn("h-4 w-4", colors.text)} />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related tracks */}
        <div>
          <h2 className="text-xl font-bold mb-5">Related tracks</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {otherTracks.map((t) => {
              const c = TRACK_COLOR_MAP[t.color] ?? TRACK_COLOR_MAP.violet;
              return (
                <Link
                  key={t.slug}
                  href={`/tracks/${t.slug}`}
                  className="group p-3 rounded-xl border border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/60 transition-all flex items-center gap-3"
                >
                  <span className="text-lg">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.estimatedHours}h</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
