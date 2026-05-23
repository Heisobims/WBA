"use client";

import { motion } from "framer-motion";
import { Trophy, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  earned: boolean;
  earnedAt?: Date | string | null;
}

interface AchievementCardProps {
  achievement: Achievement;
  index?: number;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  ENGAGEMENT: "from-brand-500 to-orange-600",
  QUALITY:    "from-emerald-500 to-teal-600",
  STREAK:     "from-orange-500 to-amber-600",
  MILESTONE:  "from-blue-500 to-blue-700",
  SPECIAL:    "from-pink-500 to-rose-600",
};

export function AchievementCard({ achievement, index = 0 }: AchievementCardProps) {
  const gradient = CATEGORY_GRADIENTS[achievement.category] || CATEGORY_GRADIENTS.SPECIAL;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-200",
        achievement.earned
          ? "bg-white border-border hover:border-brand-300 hover:shadow-card"
          : "bg-stone-50 border-border opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0",
            achievement.earned
              ? `bg-gradient-to-br ${gradient}`
              : "bg-stone-200",
          )}
        >
          {achievement.earned ? (
            achievement.icon
          ) : (
            <Lock className="h-5 w-5 text-stone-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4
              className={cn(
                "font-semibold text-sm truncate",
                achievement.earned ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {achievement.name}
            </h4>
            <span
              className={cn(
                "text-xs font-bold shrink-0",
                achievement.earned ? "text-brand-600" : "text-muted-foreground/40",
              )}
            >
              +{achievement.xpReward} XP
            </span>
          </div>
          <p className={cn("text-xs mt-0.5 line-clamp-2", achievement.earned ? "text-muted-foreground" : "text-muted-foreground/50")}>
            {achievement.description}
          </p>
          {achievement.earned && achievement.earnedAt && (
            <p className="text-xs text-brand-600/70 mt-1">
              Earned {new Date(achievement.earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {achievement.earned && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <Trophy className="h-3 w-3 text-white" />
          </div>
        </div>
      )}
    </motion.div>
  );
}
