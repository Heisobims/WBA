"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Filter } from "lucide-react";
import { AchievementCard } from "@/components/gamification/achievement-card";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  earned: boolean;
  earnedAt?: string | null;
}

const CATEGORIES = ["ALL", "ENGAGEMENT", "QUALITY", "STREAK", "MILESTONE", "SPECIAL"];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAchievements(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "ALL" ? achievements : achievements.filter((a) => a.category === filter);
  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Achievements</h1>
          </div>
          <p className="text-muted-foreground">
            {earnedCount} of {achievements.length} unlocked
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{earnedCount}</div>
          <div className="text-sm text-muted-foreground">earned</div>
        </div>
      </motion.div>

      {/* Progress bar */}
      {achievements.length > 0 && (
        <div className="space-y-1">
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(earnedCount / achievements.length) * 100}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {Math.round((earnedCount / achievements.length) * 100)}% complete
          </p>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              filter === cat
                ? "bg-ink-900 text-white border-ink-900"
                : "bg-white border-border text-muted-foreground hover:border-brand-300 hover:text-foreground",
            )}
          >
            {cat === "ALL" ? "All" : cat.charAt(0) + cat.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-stone-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((achievement, i) => (
            <AchievementCard key={achievement.id} achievement={achievement} index={i} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No achievements in this category yet</p>
        </div>
      )}
    </div>
  );
}
