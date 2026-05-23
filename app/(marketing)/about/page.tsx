import { Badge } from "@/components/ui/badge";
import { Brain, Target, Trophy, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

const STATS = [
  { value: "20+", label: "Training tracks" },
  { value: "2,400+", label: "Practice tasks" },
  { value: "15+", label: "AI companies covered" },
  { value: "3×", label: "Avg. hire rate improvement" },
];

const VALUES = [
  {
    icon: Target,
    title: "Built for real outcomes",
    desc: "Every task, exam, and track is modelled on real qualification tests used by Outlier AI, Scale AI, and Alignerr — not generic tutorials.",
  },
  {
    icon: Brain,
    title: "AI-powered feedback",
    desc: "Instant scoring and detailed explanations on every submission so you know exactly what to improve before you apply.",
  },
  {
    icon: Trophy,
    title: "Progress you can measure",
    desc: "XP, readiness scores, streaks, and skill certificates give you concrete evidence of your growth.",
  },
  {
    icon: Users,
    title: "Community of trainers",
    desc: "Learn alongside thousands of AI trainers working toward the same platforms. Compete on the leaderboard and share strategies.",
  },
];

export default function AboutPage() {
  return (
    <main className="pt-24 pb-32">
      <div className="container max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-20">
          <Badge variant="gradient" className="mb-4">About WBAcademy</Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            We help people get hired by<br />
            <span className="gradient-text">top AI companies</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            WBAcademy is the only platform purpose-built for people who want to pass qualification tests
            and land contracts with AI training companies like Outlier AI, Scale AI, and Alignerr.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center p-6 rounded-2xl border border-border bg-white shadow-card">
              <div className="text-3xl font-bold gradient-text mb-1">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="mb-20 p-8 rounded-2xl bg-stone-50 border border-border">
          <h2 className="text-2xl font-bold mb-4">Our mission</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            The AI training economy is growing rapidly, but most people fail qualification exams because
            they have no way to practice. We built WBAcademy to close that gap — giving anyone the tools
            to prepare properly, demonstrate their skills, and get hired faster.
          </p>
        </div>

        {/* Values */}
        <div>
          <h2 className="text-2xl font-bold mb-8">What we believe</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-border bg-white shadow-card">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-brand-600" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-20 text-center p-8 rounded-2xl bg-brand-50 border border-brand-200">
          <h2 className="text-xl font-bold mb-2">Get in touch</h2>
          <p className="text-muted-foreground mb-4">
            Questions, partnerships, or press enquiries — we&apos;d love to hear from you.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            Contact us
          </a>
        </div>
      </div>
    </main>
  );
}
