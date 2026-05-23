import Link from "next/link";
import { Brain, Target, GraduationCap, Trophy } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-stone-50">
      {/* Left: form */}
      <div className="flex flex-col items-center justify-center px-6 sm:px-10 lg:px-16 py-12 bg-white border-r border-border">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2.5 mb-10 group w-fit">
            <div className="h-9 w-9 rounded-lg bg-ink-900 flex items-center justify-center group-hover:bg-ink-800 transition-colors">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              WBAcademy
            </span>
          </Link>
          {children}
        </div>
      </div>

      {/* Right: brand panel */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-ink-900 relative overflow-hidden px-12">
        {/* Subtle texture */}
        <div className="absolute inset-0 opacity-5 bg-dot-grid" />

        {/* Orange glow blob */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 shadow-orange-lg mb-6">
            <Brain className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
            Get hired by top<br />
            <span className="text-brand-400">AI companies</span>
          </h2>
          <p className="text-ink-400 text-sm leading-relaxed mb-8">
            Practice the exact tasks used by Outlier AI, Scale AI, and Alignerr. Pass their qualification exams. Start earning.
          </p>

          <div className="space-y-3 text-left">
            {[
              { icon: Target,         label: "50+ practice tasks", sub: "RLHF, evaluation, coding, and more" },
              { icon: GraduationCap,  label: "Mock qualification exams", sub: "Timed, scored — just like the real thing" },
              { icon: Trophy,         label: "Track your progress", sub: "XP, streaks, and skill mastery" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-start gap-3 p-3.5 rounded-lg bg-white/5 border border-white/8">
                <div className="w-8 h-8 rounded-md bg-brand-600/20 border border-brand-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
