"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  delay?: number;
}

export function StatsCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10 border-primary/20",
  delay = 0,
}: StatsCardProps) {
  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card variant="default" className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
              <p className="text-3xl font-bold tracking-tight mt-1 truncate">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
              {trend !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                  {trendPositive ? (
                    <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                  ) : trendNegative ? (
                    <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                  ) : (
                    <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span
                    className={cn(
                      "text-xs font-medium",
                      trendPositive && "text-green-600",
                      trendNegative && "text-red-500",
                      !trendPositive && !trendNegative && "text-muted-foreground",
                    )}
                  >
                    {trendPositive ? "+" : ""}
                    {trend}% from last period
                  </span>
                </div>
              )}
            </div>
            <div
              className={cn(
                "h-12 w-12 rounded-2xl border flex items-center justify-center shrink-0",
                iconBg,
              )}
            >
              <Icon className={cn("h-6 w-6", iconColor)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
