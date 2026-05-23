"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  days: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export function StreakBadge({ days, size = "md", animated = true }: StreakBadgeProps) {
  if (days === 0) return null;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  };
  const iconSizes = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };

  const isHot = days >= 7;
  const isOnFire = days >= 30;

  const badge = (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-bold",
        sizeClasses[size],
        isOnFire
          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
          : isHot
          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
          : "bg-orange-500/20 text-orange-400 border border-orange-500/30",
      )}
    >
      <Flame
        className={cn(iconSizes[size], isOnFire || isHot ? "fill-current" : "")}
      />
      <span>{days} day{days !== 1 ? "s" : ""}</span>
    </div>
  );

  if (!animated) return badge;

  return (
    <motion.div
      animate={isOnFire ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      {badge}
    </motion.div>
  );
}
