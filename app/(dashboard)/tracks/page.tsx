"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TRAINING_TRACKS, TRACK_COLOR_MAP } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import {
  Search, ChevronRight, Clock, Star, Lock, CheckCircle2,
  Flame, Target, Trophy, Filter,
} from "lucide-react";

const DIFFICULTY_LABELS = ["", "Beginner", "Easy", "Intermediate", "Advanced", "Expert"];
const DIFFICULTY_COLORS = ["", "text-emerald-400", "text-blue-400", "text-yellow-400", "text-orange-400", "text-red-400"];

const FILTERS = ["All", "Beginner", "Intermediate", "Advanced", "In Progress", "Completed"];

export default function TracksPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = TRAINING_TRACKS.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.companies.some((c) => c.toLowerCase().includes(search.toLowerCase()));
    const matchFilter =
      filter === "All" ||
      (filter === "Beginner" && t.difficulty <= 2) ||
      (filter === "Intermediate" && t.difficulty === 3) ||
      (filter === "Advanced" && t.difficulty >= 4);
    return matchSearch && matchFilter;
  });

  return (
    <div className="pt-8 pb-16">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <Badge variant="gradient" className="mb-3">20 Training Tracks</Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Choose your training path
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Every track is built from real AI training tasks. Practice the exact skills that
            Outlier AI, Scale AI, and Alignerr test for in their qualification exams.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tracks or companies..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.slice(0, 4).map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm transition-all border",
                  filter === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-background hover:border-primary/50 text-muted-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-10 p-4 rounded-2xl border border-border/50 bg-card/30">
          {[
            { icon: Target, label: "Tracks available", value: "20" },
            { icon: Trophy, label: "Tasks per track", value: "50–120" },
            { icon: Flame, label: "Avg. completion", value: "6–15 hrs" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <div className="text-xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Tracks grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((track, i) => {
            const colors = TRACK_COLOR_MAP[track.color] ?? TRACK_COLOR_MAP.violet;
            const isLocked = !session && track.difficulty > 2;

            return (
              <motion.div
                key={track.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={session ? `/tracks/${track.slug}` : `/register`}
                  className="group block p-6 rounded-2xl border border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/60 transition-all h-full"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("w-11 h-11 rounded-xl border flex items-center justify-center text-xl", colors.bg, colors.border)}>
                      {track.icon}
                    </div>
                    {isLocked ? (
                      <Lock className="h-4 w-4 text-muted-foreground/40" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-0.5" />
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold mb-1.5 group-hover:text-primary transition-colors">
                    {track.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                    {track.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {track.estimatedHours}h
                    </span>
                    <span className={cn("font-medium", DIFFICULTY_COLORS[track.difficulty])}>
                      {DIFFICULTY_LABELS[track.difficulty]}
                    </span>
                  </div>

                  {/* Companies */}
                  <div className="flex flex-wrap gap-1.5">
                    {track.companies.slice(0, 3).map((company) => (
                      <span
                        key={company}
                        className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", colors.badge, colors.border)}
                      >
                        {company}
                      </span>
                    ))}
                    {track.companies.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                        +{track.companies.length - 3}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No tracks match your search. <button type="button" onClick={() => setSearch("")} className="text-primary hover:underline">Clear search</button>
          </div>
        )}
      </div>
    </div>
  );
}
