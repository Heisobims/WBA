import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen, Zap, Database, Shield, Bot, Code2, Rocket, ChevronRight,
  Terminal, Key, Globe, Users, BarChart3, Webhook, FileJson, ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Documentation – WBAcademy",
  description: "Everything you need to get started with WBAcademy.",
};

const SECTIONS = [
  {
    id: "getting-started",
    icon: Rocket,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    title: "Getting Started",
    items: [
      { title: "Quick Start Guide", desc: "Up and running in 5 minutes", href: "#quickstart" },
      { title: "Environment Setup", desc: "Configure your local environment", href: "#environment" },
      { title: "Database Setup", desc: "PostgreSQL schema and migrations", href: "#database" },
      { title: "Authentication", desc: "OAuth, magic links, credentials", href: "#auth" },
    ],
  },
  {
    id: "questionnaires",
    icon: FileJson,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    title: "Questionnaires",
    items: [
      { title: "Building Questionnaires", desc: "Drag-and-drop builder guide", href: "#builder" },
      { title: "Question Types", desc: "All 27 types explained", href: "#question-types" },
      { title: "Adaptive Flows", desc: "AI-powered branching logic", href: "#adaptive" },
      { title: "Publishing & Sharing", desc: "Make questionnaires live", href: "#publishing" },
    ],
  },
  {
    id: "ai",
    icon: Bot,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    title: "AI Features",
    items: [
      { title: "Question Generation", desc: "GPT-4o powered question creation", href: "#ai-generation" },
      { title: "Response Scoring", desc: "Automated quality evaluation", href: "#scoring" },
      { title: "Adaptive Follow-ups", desc: "Dynamic follow-up questions", href: "#followups" },
      { title: "Toxicity Detection", desc: "Automatic content moderation", href: "#toxicity" },
    ],
  },
  {
    id: "api",
    icon: Code2,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    title: "API Reference",
    items: [
      { title: "Authentication", desc: "API keys and session tokens", href: "#api-auth" },
      { title: "Questionnaires API", desc: "CRUD operations", href: "#api-questionnaires" },
      { title: "Responses API", desc: "Submit and retrieve responses", href: "#api-responses" },
      { title: "Analytics API", desc: "Usage stats and metrics", href: "#api-analytics" },
    ],
  },
  {
    id: "gamification",
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    title: "Gamification",
    items: [
      { title: "XP & Leveling System", desc: "How points and levels work", href: "#xp" },
      { title: "Achievements", desc: "Unlockable badges and rewards", href: "#achievements" },
      { title: "Leaderboards", desc: "Weekly, monthly, all-time", href: "#leaderboards" },
      { title: "Streaks", desc: "Daily engagement rewards", href: "#streaks" },
    ],
  },
  {
    id: "admin",
    icon: Shield,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    title: "Admin & Security",
    items: [
      { title: "Role-Based Access Control", desc: "5 roles explained", href: "#rbac" },
      { title: "Content Moderation", desc: "Review flagged responses", href: "#moderation" },
      { title: "Audit Logs", desc: "Full activity trail", href: "#audit" },
      { title: "Dataset Export", desc: "Export training data", href: "#datasets" },
    ],
  },
];

const QUICK_LINKS = [
  { icon: Terminal, label: "CLI Reference", href: "#cli" },
  { icon: Key, label: "API Keys", href: "#api-keys" },
  { icon: Webhook, label: "Webhooks", href: "#webhooks" },
  { icon: Globe, label: "Deployment", href: "#deployment" },
  { icon: Users, label: "Teams", href: "#teams" },
  { icon: BarChart3, label: "Analytics", href: "#analytics" },
];

export default function DocsPage() {
  return (
    <main className="pt-24 pb-32">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="gradient" className="mb-4">Documentation</Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Everything you need to know
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive guides, API references, and tutorials to help you build
            high-quality AI training datasets with WBAcademy.
          </p>
        </div>

        {/* Search bar (static UI) */}
        <div className="relative max-w-2xl mx-auto mb-16">
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white/30">
            <BookOpen className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">Search documentation...</span>
            <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded font-mono">⌘K</span>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-16">
          {QUICK_LINKS.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/10 transition-all text-center group"
            >
              <Icon className="h-5 w-5 text-white/40 group-hover:text-violet-400 transition-colors" />
              <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors">{label}</span>
            </Link>
          ))}
        </div>

        {/* Section grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {SECTIONS.map((section) => (
            <Card key={section.id} variant="default" className="group hover:border-white/20 transition-all">
              <CardContent className="p-6">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${section.bg}`}>
                  <section.icon className={`h-5 w-5 ${section.color}`} />
                </div>
                <h2 className="font-bold text-lg mb-3">{section.title}</h2>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        className="flex items-center justify-between gap-2 text-sm text-muted-foreground hover:text-foreground group/link transition-colors py-1"
                      >
                        <span>
                          <span className="text-foreground/80 font-medium">{item.title}</span>
                          <span className="block text-xs text-muted-foreground/70 mt-0.5">{item.desc}</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Inline docs content */}
        <div className="max-w-3xl mx-auto space-y-16">

          {/* Quick Start */}
          <section id="quickstart" className="scroll-mt-24">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Rocket className="h-6 w-6 text-violet-400" /> Quick Start
            </h2>
            <p className="text-muted-foreground mb-6">Get WBAcademy running locally in under 5 minutes.</p>
            <div className="space-y-4">
              {[
                { step: "1", title: "Clone & install", code: "git clone <repo>\ncd wbacademy\nnpm install" },
                { step: "2", title: "Configure environment", code: "cp .env.example .env.local\n# Fill in DATABASE_URL, NEXTAUTH_SECRET, OPENAI_API_KEY" },
                { step: "3", title: "Set up database", code: "npx prisma db push\nnpx tsx prisma/seed.ts" },
                { step: "4", title: "Start dev server", code: "npm run dev\n# Open http://localhost:3000" },
              ].map(({ step, title, code }) => (
                <div key={step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0 mt-1">
                    {step}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-2">{title}</p>
                    <pre className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white/70 font-mono overflow-x-auto">
                      {code}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Question Types */}
          <section id="question-types" className="scroll-mt-24">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <FileJson className="h-6 w-6 text-blue-400" /> Question Types
            </h2>
            <p className="text-muted-foreground mb-6">WBAcademy supports 27 question types across 5 categories.</p>
            <div className="grid gap-3">
              {[
                { category: "Basic", types: ["Text Short", "Text Long", "Essay", "Single Choice", "Multiple Choice", "Rating Scale", "Slider"] },
                { category: "Media", types: ["Image Based", "Audio Question", "Video Question", "File Upload", "Voice Recording"] },
                { category: "AI Training", types: ["RLHF Task", "Comparative Ranking", "Data Labeling", "Sentiment Classification", "AI Conversation"] },
                { category: "Assessment", types: ["Code Editor", "Timed Question", "Personality Assessment", "Situational Judgment", "Interactive Scenario"] },
                { category: "Specialized", types: ["Drag & Drop Ranking", "Match Following", "Annotation Task", "Translation Task", "CAPTCHA Validation"] },
              ].map(({ category, types }) => (
                <div key={category} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">{category}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {types.map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/60">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* XP System */}
          <section id="xp" className="scroll-mt-24">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-400" /> XP & Leveling
            </h2>
            <p className="text-muted-foreground mb-6">
              Users earn XP for completing questionnaires. The level formula creates a smooth progression curve.
            </p>
            <pre className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white/70 font-mono mb-4">
{`level = floor(sqrt(xp / 100)) + 1
xpForNextLevel = level² × 100

// Examples:
// 0 XP    → Level 1
// 100 XP  → Level 2
// 400 XP  → Level 3
// 900 XP  → Level 4
// 10000 XP → Level 11`}
            </pre>
            <p className="text-sm text-muted-foreground">
              XP is awarded per questionnaire completion. Bonus XP is granted for streaks, high quality scores, and achievements.
            </p>
          </section>

          {/* RBAC */}
          <section id="rbac" className="scroll-mt-24">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-400" /> Role-Based Access Control
            </h2>
            <p className="text-muted-foreground mb-6">Five roles with escalating permissions.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 text-white/50 font-medium">Role</th>
                    <th className="text-left py-2 pr-4 text-white/50 font-medium">Capabilities</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ["USER", "Complete questionnaires, view own profile & stats"],
                    ["AI_TRAINER", "Access dataset exports, view analytics"],
                    ["REVIEWER", "Review & moderate flagged responses"],
                    ["ADMIN", "Manage users, publish questionnaires, view all data"],
                    ["SUPER_ADMIN", "Full access including role assignment and system config"],
                  ].map(([role, caps]) => (
                    <tr key={role}>
                      <td className="py-2 pr-4">
                        <code className="text-xs bg-white/5 px-2 py-0.5 rounded text-violet-400">{role}</code>
                      </td>
                      <td className="py-2 text-white/60">{caps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Deployment */}
          <section id="deployment" className="scroll-mt-24">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Globe className="h-6 w-6 text-emerald-400" /> Deployment
            </h2>
            <p className="text-muted-foreground mb-6">
              Deploy to Vercel (frontend) + Railway or Supabase (database) in minutes.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: "Vercel (Recommended)",
                  steps: ["Push to GitHub", "Import project in Vercel", "Add environment variables", "Deploy"],
                  href: "https://vercel.com/new",
                },
                {
                  title: "Railway",
                  steps: ["Create Railway project", "Add PostgreSQL plugin", "Set DATABASE_URL", "Deploy via GitHub"],
                  href: "https://railway.app",
                },
              ].map(({ title, steps, href }) => (
                <div key={title} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                  <p className="font-semibold">{title}</p>
                  <ol className="space-y-1">
                    {steps.map((s, i) => (
                      <li key={i} className="text-sm text-white/50 flex gap-2">
                        <span className="text-violet-400 font-mono shrink-0">{i + 1}.</span> {s}
                      </li>
                    ))}
                  </ol>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300"
                  >
                    Open {title} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
