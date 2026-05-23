import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for AI training data collection.",
};

const PLANS = [
  {
    name: "Free",
    price: 0,
    period: "/month",
    description: "For individuals exploring AI training",
    cta: "Get started free",
    href: "/register",
    highlight: false,
    features: {
      "Responses/month": "100",
      "Questionnaires": "5",
      "Question types": "10",
      "AI scoring": false,
      "Analytics dashboard": "Basic",
      "Export formats": "CSV",
      "Team members": "1",
      "API access": false,
      "Custom branding": false,
      "Priority support": false,
    },
  },
  {
    name: "Starter",
    price: 29,
    period: "/month",
    description: "For small teams and researchers",
    cta: "Start Starter trial",
    href: "/register?plan=starter",
    highlight: false,
    features: {
      "Responses/month": "2,500",
      "Questionnaires": "25",
      "Question types": "20",
      "AI scoring": true,
      "Analytics dashboard": "Advanced",
      "Export formats": "CSV, JSON, JSONL",
      "Team members": "5",
      "API access": true,
      "Custom branding": false,
      "Priority support": false,
    },
  },
  {
    name: "Pro",
    price: 79,
    period: "/month",
    description: "For serious AI trainers",
    cta: "Start Pro trial",
    href: "/register?plan=pro",
    highlight: true,
    features: {
      "Responses/month": "10,000",
      "Questionnaires": "Unlimited",
      "Question types": "All 27",
      "AI scoring": true,
      "Analytics dashboard": "Full + Heatmaps",
      "Export formats": "All formats",
      "Team members": "20",
      "API access": true,
      "Custom branding": true,
      "Priority support": true,
    },
  },
  {
    name: "Enterprise",
    price: null,
    period: "",
    description: "For teams training production AI",
    cta: "Contact sales",
    href: "/contact",
    highlight: false,
    features: {
      "Responses/month": "Unlimited",
      "Questionnaires": "Unlimited",
      "Question types": "All 27 + Custom",
      "AI scoring": true,
      "Analytics dashboard": "Custom + BI integration",
      "Export formats": "All + Custom pipelines",
      "Team members": "Unlimited",
      "API access": true,
      "Custom branding": true,
      "Priority support": "24/7 dedicated",
    },
  },
];

export default function PricingPage() {
  return (
    <main className="pt-24 pb-32">
      <div className="container">
        <div className="text-center mb-16">
          <Badge variant="gradient" className="mb-4">Pricing</Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free. Scale as your AI training needs grow. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              variant={plan.highlight ? "highlight" : "default"}
              className="relative"
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="gradient" className="gap-1">
                    <Zap className="h-3 w-3" />Most Popular
                  </Badge>
                </div>
              )}
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>
                  {plan.price !== null ? (
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground text-sm pb-0.5">/mo</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold">Custom</div>
                  )}
                </div>

                <Button
                  variant={plan.highlight ? "gradient" : "outline"}
                  className="w-full mb-6"
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>

                <div className="space-y-3">
                  {Object.entries(plan.features).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-muted-foreground text-xs">{key}</span>
                      {typeof value === "boolean" ? (
                        value ? (
                          <Check className="h-4 w-4 text-green-400 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                        )
                      ) : (
                        <span className="text-xs font-medium text-right">{value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I switch plans at any time?",
                a: "Yes, you can upgrade or downgrade at any time. Changes take effect immediately and billing is prorated.",
              },
              {
                q: "What happens when I hit my response limit?",
                a: "We'll notify you at 80% and 100% of your limit. Responses stop being collected until you upgrade or the next billing cycle.",
              },
              {
                q: "Is there a free trial for paid plans?",
                a: "Yes! All paid plans come with a 14-day free trial. No credit card required to start.",
              },
              {
                q: "What export formats are supported?",
                a: "We support CSV, JSON, JSONL (for direct LLM fine-tuning), and custom pipeline integrations on Enterprise.",
              },
            ].map((faq) => (
              <Card key={faq.q} variant="default">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
