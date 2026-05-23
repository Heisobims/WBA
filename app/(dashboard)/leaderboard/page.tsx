"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Crown, Zap, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { LevelBadge } from "@/components/gamification/level-badge";
import { cn } from "@/lib/utils";

type Period = "allTime" | "weekly" | "monthly";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  user: { id: string; name: string | null; image: string | null; level: number };
  xpPoints: number;
  totalResponses: number;
  avgQualityScore: number;
  isCurrentUser: boolean;
}

const PERIOD_LABELS: Record<Period, string> = {
  allTime: "All Time",
  weekly: "This Week",
  monthly: "This Month",
};

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [period, setPeriod] = useState<Period>("allTime");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setEntries(data.data);
          setCurrentUser(data.currentUser || null);
        }
      })
      .finally(() => setLoading(false));
  }, [period]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">Top contributors ranked by experience points</p>
      </motion.div>

      {/* Period Selector */}
      <div className="flex items-center justify-center gap-2">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
              period === p
                ? "bg-ink-900 text-white border-ink-900"
                : "text-muted-foreground border-border hover:border-brand-300 hover:text-foreground bg-white",
            )}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-stone-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-3 items-end"
            >
              <PodiumCard entry={top3[1]} position={2} />
              <PodiumCard entry={top3[0]} position={1} featured />
              <PodiumCard entry={top3[2]} position={3} />
            </motion.div>
          )}

          {/* Rest of Leaderboard */}
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              {rest.map((entry, i) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all",
                    entry.isCurrentUser
                      ? "border-brand-300 bg-brand-50"
                      : "bg-white border-border hover:border-brand-200 hover:bg-stone-50",
                  )}
                >
                  <span className="w-8 text-center font-bold text-muted-foreground text-sm">
                    #{entry.rank}
                  </span>
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-stone-100 flex-shrink-0">
                    {entry.user.image ? (
                      <Image
                        src={entry.user.image}
                        alt={entry.user.name || ""}
                        width={36}
                        height={36}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-bold">
                        {entry.user.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {entry.user.name || "Anonymous"}
                      </span>
                      {entry.isCurrentUser && (
                        <span className="text-xs text-brand-600 font-medium">(you)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{entry.totalResponses} responses</span>
                      <span>~{entry.avgQualityScore}% quality</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <LevelBadge level={entry.user.level} size="sm" />
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-brand-600 font-bold text-sm">
                        <Zap className="h-3.5 w-3.5 fill-current" />
                        {entry.xpPoints.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">XP</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Current user floating card if not in top list */}
          {currentUser && currentUser.rank > entries.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky bottom-4 border border-brand-300 bg-brand-50 p-4 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm">Your rank:</span>
                <span className="font-bold">#{currentUser.rank}</span>
                <div className="flex-1" />
                <div className="flex items-center gap-1 text-brand-600 font-bold">
                  <Zap className="h-4 w-4 fill-current" />
                  {currentUser.xpPoints.toLocaleString()} XP
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

function PodiumCard({
  entry,
  position,
  featured = false,
}: {
  entry: LeaderboardEntry;
  position: number;
  featured?: boolean;
}) {
  const icons = [
    <Crown key={1} className="h-5 w-5 text-yellow-500" />,
    <Medal key={2} className="h-4 w-4 text-slate-400" />,
    <Star key={3} className="h-4 w-4 text-amber-600" />,
  ];
  const heights = ["pb-8", "pb-4", "pb-2"];
  const styles = [
    "bg-gradient-to-b from-yellow-50 to-orange-50 border-yellow-300",
    "bg-gradient-to-b from-slate-50 to-stone-50 border-slate-200",
    "bg-gradient-to-b from-amber-50 to-orange-50 border-amber-200",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (position - 1) * 0.1 }}
      className={cn(
        "flex flex-col items-center p-4 rounded-2xl border text-center",
        styles[position - 1],
        heights[position - 1],
        featured && "ring-2 ring-yellow-400/60",
      )}
    >
      <div className="mb-2">{icons[position - 1]}</div>
      <div
        className={cn(
          "rounded-full overflow-hidden bg-stone-100 mb-2 flex-shrink-0",
          featured ? "w-16 h-16" : "w-12 h-12",
        )}
      >
        {entry.user.image ? (
          <Image
            src={entry.user.image}
            alt={entry.user.name || ""}
            width={featured ? 64 : 48}
            height={featured ? 64 : 48}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
            {entry.user.name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
      </div>
      <div className="font-semibold text-sm truncate w-full">
        {entry.user.name || "Anonymous"}
        {entry.isCurrentUser && <span className="text-brand-600"> (you)</span>}
      </div>
      <div className="flex items-center gap-1 text-brand-600 font-bold text-xs mt-1">
        <Zap className="h-3 w-3 fill-current" />
        {entry.xpPoints.toLocaleString()}
      </div>
      <LevelBadge level={entry.user.level} size="xs" showIcon={false} />
    </motion.div>
  );
}
