"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Check, ChevronRight, Brain, Zap, Target,
  GraduationCap, Trophy, Play,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TRAINING_TRACKS } from "@/lib/tracks";

const TARGET_COMPANIES = [
  { id: "outlier", name: "Outlier AI", desc: "RLHF & response evaluation" },
  { id: "scale", name: "Scale AI", desc: "Annotation & evaluation tasks" },
  { id: "alignerr", name: "Alignerr", desc: "Prompt & creative writing" },
  { id: "dataannotation", name: "DataAnnotation.tech", desc: "General annotation" },
  { id: "remotasks", name: "Remotasks", desc: "Multi-skill platform" },
  { id: "appen", name: "Appen", desc: "Data collection & labeling" },
];

const EXPERIENCE_LEVELS = [
  { value: "new", label: "Brand new", desc: "Never done AI training work before", icon: "🌱" },
  { value: "some", label: "Some experience", desc: "Done a few tasks on a platform", icon: "🌿" },
  { value: "active", label: "Active annotator", desc: "Currently working on AI platforms", icon: "⚡" },
  { value: "expert", label: "Experienced", desc: "Domain expert (STEM, coding, law, etc.)", icon: "🎯" },
];

const TOP_TRACKS = TRAINING_TRACKS.slice(0, 6).map((t) => ({
  slug: t.slug,
  name: t.name,
  icon: t.icon,
  desc: t.description.slice(0, 60) + "…",
}));

const STEPS = ["Welcome", "Target", "Experience", "Track", "Ready"];

interface OnboardingData {
  companies: string[];
  experience: string;
  primaryTrack: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    companies: [],
    experience: "",
    primaryTrack: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function toggleCompany(id: string) {
    setData((prev) => ({
      ...prev,
      companies: prev.companies.includes(id)
        ? prev.companies.filter((c) => c !== id)
        : [...prev.companies, id],
    }));
  }

  const canAdvance = () => {
    if (step === 1) return data.companies.length >= 1;
    if (step === 2) return !!data.experience;
    if (step === 3) return !!data.primaryTrack;
    return true;
  };

  async function finish() {
    setSubmitting(true);
    try {
      await fetch("/api/users/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests: data.companies,
          skillLevel: data.experience === "new" ? "1" : data.experience === "some" ? "2" : data.experience === "active" ? "3" : "4",
          goals: ["get_hired"],
          primaryTrack: data.primaryTrack,
        }),
      });
      await updateSession();
      router.push(`/tracks/${data.primaryTrack}`);
    } catch {
      toast.error("Something went wrong, please try again");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full transition-all duration-300",
                i === step
                  ? "w-6 h-2 bg-brand-600"
                  : i < step
                  ? "w-2 h-2 bg-brand-600"
                  : "w-2 h-2 bg-border",
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-border bg-white shadow-card p-8 space-y-6"
          >
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="text-center space-y-5">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-brand-600 flex items-center justify-center shadow-orange-lg">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome, {session?.user?.name?.split(" ")[0] || "there"}!
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    WBAcademy prepares you to pass qualification exams and get hired
                    on <strong className="text-foreground">Outlier AI, Scale AI, Alignerr</strong> and more.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Target, label: "Targeted practice" },
                    { icon: GraduationCap, label: "Mock exams" },
                    { icon: Trophy, label: "Get hired faster" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="p-3 rounded-xl bg-stone-50 border border-border text-center">
                      <Icon className="h-5 w-5 text-brand-600 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-xs text-amber-700 flex items-center justify-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    Takes 2 minutes · Personalizes your training path
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Target companies */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold">Which platforms are you targeting?</h2>
                  <p className="text-muted-foreground text-sm mt-1">Select all you're interested in (pick at least 1)</p>
                </div>
                <div className="space-y-2">
                  {TARGET_COMPANIES.map((co) => {
                    const selected = data.companies.includes(co.id);
                    return (
                      <button
                        key={co.id}
                        type="button"
                        onClick={() => toggleCompany(co.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all",
                          selected
                            ? "bg-brand-50 border-brand-300"
                            : "bg-white border-border hover:border-brand-200 hover:bg-stone-50",
                        )}
                      >
                        <div>
                          <p className={cn("font-semibold text-sm", selected ? "text-brand-700" : "text-foreground")}>
                            {co.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{co.desc}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                          selected ? "bg-brand-600 border-brand-600" : "border-border",
                        )}>
                          {selected && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Experience level */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold">What's your AI training experience?</h2>
                  <p className="text-muted-foreground text-sm mt-1">We'll calibrate your starting difficulty</p>
                </div>
                <div className="space-y-2.5">
                  {EXPERIENCE_LEVELS.map((level) => {
                    const selected = data.experience === level.value;
                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setData((d) => ({ ...d, experience: level.value }))}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                          selected
                            ? "bg-brand-50 border-brand-300"
                            : "bg-white border-border hover:border-brand-200 hover:bg-stone-50",
                        )}
                      >
                        <span className="text-2xl">{level.icon}</span>
                        <div className="flex-1">
                          <p className={cn("font-semibold text-sm", selected ? "text-brand-700" : "text-foreground")}>
                            {level.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{level.desc}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                          selected ? "bg-brand-600 border-brand-600" : "border-border",
                        )}>
                          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Pick a training track */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold">Choose your first training track</h2>
                  <p className="text-muted-foreground text-sm mt-1">You can switch at any time</p>
                </div>
                <div className="space-y-2">
                  {TOP_TRACKS.map((track) => {
                    const selected = data.primaryTrack === track.slug;
                    return (
                      <button
                        key={track.slug}
                        type="button"
                        onClick={() => setData((d) => ({ ...d, primaryTrack: track.slug }))}
                        className={cn(
                          "w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                          selected
                            ? "bg-brand-50 border-brand-300"
                            : "bg-white border-border hover:border-brand-200 hover:bg-stone-50",
                        )}
                      >
                        <span className="text-xl shrink-0">{track.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={cn("font-semibold text-sm truncate", selected ? "text-brand-700" : "text-foreground")}>
                            {track.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{track.desc}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                          selected ? "bg-brand-600 border-brand-600" : "border-border",
                        )}>
                          {selected && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Ready */}
            {step === 4 && (
              <div className="text-center space-y-5">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                  className="w-20 h-20 mx-auto rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                >
                  <Check className="h-10 w-10 text-white" />
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold">Your path is set!</h2>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Starting you on <strong className="text-foreground">
                      {TOP_TRACKS.find((t) => t.slug === data.primaryTrack)?.name ?? "your chosen track"}
                    </strong>
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: Brain, label: "Practice tasks unlocked", value: "50+ tasks" },
                    { icon: GraduationCap, label: "Qualification exams ready", value: "6 exams" },
                    { icon: Brain, label: "AI Tutor available", value: "24/7" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-border">
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-brand-600" />
                        <span className="text-sm text-muted-foreground">{label}</span>
                      </div>
                      <span className="text-sm font-semibold text-brand-600">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-brand-50 border border-brand-200">
                  <div className="flex items-center justify-center gap-2 text-brand-700 font-bold">
                    <Zap className="h-4 w-4 fill-current" />
                    <span>+50 XP Welcome Bonus!</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className="disabled:opacity-0"
              >
                Back
              </Button>

              {step < 4 ? (
                <Button
                  type="button"
                  variant="default"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canAdvance()}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                  className="rounded-xl px-6"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="gradient"
                  onClick={finish}
                  disabled={submitting}
                  loading={submitting}
                  rightIcon={<Play className="h-4 w-4" />}
                  className="rounded-xl px-6"
                >
                  {submitting ? "Setting up…" : "Start training"}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-xs text-muted-foreground/60 mt-4">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  );
}
