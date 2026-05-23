import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain, Zap, BarChart3, Shield, Bot, Trophy, Database, Users,
  Code, Mic, Image, FileQuestion, Layers, MessageSquare, Clock,
  Globe, Lock, Cpu, SlidersHorizontal, Video, GitBranch
} from "lucide-react";

export const metadata: Metadata = {
  title: "Features",
  description: "Explore all features of WBAcademy training platform.",
};

const FEATURE_SECTIONS = [
  {
    badge: "Question Engine",
    title: "27 question types for every data need",
    description: "From simple text responses to complex RLHF tasks, annotation workflows, and AI conversations.",
    items: [
      { icon: MessageSquare, label: "Multiple & Single Choice", desc: "Classic selection with image support and randomization" },
      { icon: FileQuestion, label: "Text & Essay", desc: "Short text, long-form, with quality filters" },
      { icon: Code, label: "Code Editor", desc: "Monaco-powered with syntax highlighting and execution" },
      { icon: Mic, label: "Voice Recording", desc: "Audio capture with transcription" },
      { icon: Image, label: "Image Annotation", desc: "Draw, label, and classify image regions" },
      { icon: Video, label: "Video Response", desc: "Webcam capture with timestamped notes" },
      { icon: SlidersHorizontal, label: "Slider & Rating", desc: "Scales, NPS, emoji ratings" },
      { icon: Layers, label: "Drag & Drop Ranking", desc: "Reorderable items and comparison tasks" },
      { icon: Bot, label: "AI Conversation", desc: "Simulated dialogues powered by GPT-4o" },
      { icon: Brain, label: "RLHF Tasks", desc: "Preference ranking and reward model training" },
      { icon: Globe, label: "Translation Tasks", desc: "Multi-language quality assessment" },
      { icon: Cpu, label: "Data Labeling", desc: "Classification, NER, and structured labeling" },
    ],
  },
  {
    badge: "Flow Engine",
    title: "Adaptive, intelligent questionnaire flows",
    items: [
      { icon: GitBranch, label: "Conditional Branching", desc: "Show/hide questions based on any prior answer" },
      { icon: Zap, label: "AI-Generated Follow-ups", desc: "GPT-4o generates contextual follow-up questions in real time" },
      { icon: Clock, label: "Timed Questions", desc: "Per-question and per-questionnaire time limits" },
      { icon: Brain, label: "Adaptive Difficulty", desc: "Dynamically adjusts based on performance" },
      { icon: Database, label: "Session Resume", desc: "Save progress and continue later across devices" },
      { icon: SlidersHorizontal, label: "Randomized Ordering", desc: "Shuffle questions to reduce position bias" },
    ],
  },
  {
    badge: "Analytics",
    title: "Insights that improve your training data",
    items: [
      { icon: BarChart3, label: "Real-time Dashboard", desc: "Live response tracking and quality metrics" },
      { icon: Layers, label: "Drop-off Heatmaps", desc: "See exactly where participants abandon" },
      { icon: Bot, label: "AI Confidence Scores", desc: "Per-question scoring from GPT-4o" },
      { icon: Users, label: "Cohort Analysis", desc: "Compare response quality across user segments" },
      { icon: Clock, label: "Time Analytics", desc: "Per-question time spent and response patterns" },
      { icon: Database, label: "Dataset Statistics", desc: "Token counts, quality distribution, and coverage" },
    ],
  },
  {
    badge: "Security",
    title: "Enterprise-grade security by default",
    items: [
      { icon: Shield, label: "RBAC Permissions", desc: "5-tier role system from Super Admin to User" },
      { icon: Lock, label: "End-to-End Encryption", desc: "All data encrypted at rest and in transit" },
      { icon: Globe, label: "GDPR Compliance", desc: "Data residency, consent management, right-to-delete" },
      { icon: Bot, label: "Toxicity Detection", desc: "AI-powered moderation flags harmful content" },
      { icon: Clock, label: "Rate Limiting", desc: "Per-user and per-endpoint request controls" },
      { icon: Database, label: "Full Audit Logs", desc: "Every action logged with user, timestamp, and diff" },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <main className="pt-24 pb-32">
      <div className="container">
        <div className="text-center mb-20">
          <Badge variant="gradient" className="mb-4">Platform Features</Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            The complete AI training platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every feature you need to collect, quality-control, and export high-quality AI training data at scale.
          </p>
        </div>

        <div className="space-y-24">
          {FEATURE_SECTIONS.map((section) => (
            <div key={section.badge}>
              <div className="mb-10">
                <Badge variant="default" className="mb-3">{section.badge}</Badge>
                <h2 className="text-3xl font-bold mb-3">{section.title}</h2>
                {section.description && (
                  <p className="text-muted-foreground max-w-xl">{section.description}</p>
                )}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item) => (
                  <Card key={item.label} variant="default" hover="lift">
                    <CardContent className="p-5 flex gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-1">{item.label}</h3>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
