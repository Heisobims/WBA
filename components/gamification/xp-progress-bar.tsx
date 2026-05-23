"use client";

import { motion } from "framer-motion";
import { levelProgress } from "@/lib/utils";
import { Zap } from "lucide-react";

interface XPProgressBarProps {
  xpPoints: number;
  showDetails?: boolean;
  compact?: boolean;
}

export function XPProgressBar({ xpPoints, showDetails = true, compact = false }: XPProgressBarProps) {
  const { level, currentXP, neededXP, percent } = levelProgress(xpPoints);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-brand-600">
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span className="text-xs font-bold">Lv.{level}</span>
        </div>
        <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden min-w-[60px]">
          <motion.div
            className="h-full xp-fill rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{xpPoints.toLocaleString()} XP</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showDetails && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-brand-600 font-semibold">
            <Zap className="h-4 w-4 fill-current" />
            <span>Level {level}</span>
          </div>
          <span className="text-muted-foreground">
            {currentXP.toLocaleString()} / {neededXP.toLocaleString()} XP
          </span>
        </div>
      )}
      <div className="xp-bar">
        <motion.div
          className="xp-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        />
      </div>
      {showDetails && (
        <p className="text-xs text-muted-foreground text-right">
          {(neededXP - currentXP).toLocaleString()} XP to Level {level + 1}
        </p>
      )}
    </div>
  );
}
