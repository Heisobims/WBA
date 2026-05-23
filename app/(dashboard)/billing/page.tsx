"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  CreditCard, Check, Zap, Crown, Building2, ArrowRight, Shield, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Start practicing AI training tasks immediately.",
    features: [
      "5 training tracks (beginner)",
      "50 practice tasks/month",
      "Basic AI scoring & feedback",
      "Progress tracking",
      "2 mock exams/month",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 19,
    period: "month",
    description: "Unlimited practice. Serious preparation.",
    badge: "Most Popular",
    highlight: true,
    features: [
      "All 20 training tracks",
      "Unlimited practice tasks",
      "Advanced AI feedback",
      "Unlimited mock exams",
      "AI tutor assistant",
      "Skill certificates",
      "Leaderboard access",
    ],
  },
  {
    id: "ENTERPRISE",
    name: "Teams",
    price: 49,
    period: "month",
    description: "For bootcamps, agencies, and study groups.",
    features: [
      "Everything in Pro",
      "Up to 10 members",
      "Team leaderboard",
      "Progress reports",
      "Custom tracks",
      "Priority support",
    ],
  },
];

export default function BillingPage() {
  const { data: session } = useSession();
  const currentPlan = (session?.user as any)?.plan ?? "FREE";

  async function handleUpgrade(planId: string) {
    if (planId === currentPlan) return;
    if (planId === "FREE") {
      toast.info("Contact support to downgrade your plan.");
      return;
    }
    toast.info("Redirecting to checkout… (Stripe integration coming soon)");
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-bold text-foreground">
          Plans & <span className="gradient-text">Billing</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Upgrade to unlock all training tracks, unlimited practice, and the AI tutor.
        </p>
      </motion.div>

      {/* Current Plan Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 border border-border bg-white shadow-card flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="font-bold text-foreground capitalize">{currentPlan.toLowerCase()} Plan</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Secured by Stripe</span>
        </div>
      </motion.div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan, i) => {
          const isCurrent = plan.id === currentPlan;
          const isDowngrade = PLANS.findIndex((p) => p.id === currentPlan) > i;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative rounded-2xl p-6 border flex flex-col gap-5 bg-white",
                plan.highlight
                  ? "border-brand-400 shadow-orange"
                  : "border-border shadow-card",
                isCurrent && "ring-2 ring-brand-200",
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white bg-brand-600">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-1">
                  {plan.id === "FREE" && <Zap className="h-4 w-4 text-muted-foreground" />}
                  {plan.id === "PRO" && <Crown className="h-4 w-4 text-brand-600" />}
                  {plan.id === "ENTERPRISE" && <Building2 className="h-4 w-4 text-amber-600" />}
                  <h3 className="font-bold text-foreground">{plan.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div>
                <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                <span className="text-muted-foreground text-sm">/{plan.period}</span>
              </div>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent}
                variant={isCurrent ? "secondary" : plan.highlight ? "gradient" : "default"}
                className="w-full"
              >
                {isCurrent ? (
                  "Current Plan"
                ) : isDowngrade ? (
                  "Downgrade"
                ) : (
                  <>
                    Upgrade to {plan.name}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-8 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>SSL Secured</span>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Cancel anytime</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>GDPR Compliant</span>
        </div>
      </motion.div>
    </div>
  );
}
