"use client";

import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface LevelBadgeProps {
  level: number;
  size?: "xs" | "sm" | "md" | "lg";
  showIcon?: boolean;
}

const LEVEL_TIERS = [
  { min: 1, max: 5, gradient: "from-gray-400 to-gray-600", label: "Novice" },
  { min: 6, max: 15, gradient: "from-green-400 to-emerald-600", label: "Apprentice" },
  { min: 16, max: 30, gradient: "from-blue-400 to-indigo-600", label: "Adept" },
  { min: 31, max: 50, gradient: "from-brand-500 to-orange-600", label: "Expert" },
  { min: 51, max: 75, gradient: "from-orange-400 to-amber-600", label: "Master" },
  { min: 76, max: Infinity, gradient: "from-yellow-400 to-orange-500", label: "Legend" },
];

export function getLevelTier(level: number) {
  return LEVEL_TIERS.find((t) => level >= t.min && level <= t.max) || LEVEL_TIERS[0];
}

export function LevelBadge({ level, size = "md", showIcon = true }: LevelBadgeProps) {
  const tier = getLevelTier(level);

  const sizeClasses = {
    xs: "text-xs px-1.5 py-0.5 rounded-md",
    sm: "text-xs px-2 py-0.5 rounded-lg",
    md: "text-sm px-2.5 py-1 rounded-lg",
    lg: "text-base px-3 py-1.5 rounded-xl",
  };
  const iconSizes = { xs: "h-2.5 w-2.5", sm: "h-3 w-3", md: "h-3.5 w-3.5", lg: "h-4 w-4" };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-bold text-white",
        `bg-gradient-to-r ${tier.gradient}`,
        sizeClasses[size],
      )}
    >
      {showIcon && <Zap className={cn(iconSizes[size], "fill-current")} />}
      {level}
    </span>
  );
}
