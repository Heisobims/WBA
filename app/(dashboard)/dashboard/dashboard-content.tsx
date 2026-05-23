"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FileQuestion, BarChart3, Zap, Trophy, Flame, ArrowRight,
  Plus, Star, Clock, CheckCircle, Eye, Sparkles, Brain,
  Target, GraduationCap, Play, BookOpen, TrendingUp,
} from "lucide-react";
import { TRAINING_TRACKS, TRACK_COLOR_MAP } from "@/lib/tracks";
import { levelProgress, formatDate, formatRelative, cn } from "@/lib/utils";

interface DashboardContentProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    xpPoints: number;
    level: number;
    streakDays: number;
    totalResponses: number;
    completedQuestionnaires: number;
    avgQualityScore: number | null;
    createdAt: Date;
  };
  recentResponses: Array<{
    id: string;
    status: string;
    startedAt: Date;
    completedAt: Date | null;
    qualityScore: number | null;
    questionnaire: { id: string; title: string; category: string | null };
  }>;
  recentQuestionnaires: Array<{
    id: string;
    title: string;
    status: string;
    category: string | null;
    updatedAt: Date;
    _count: { responses: number; questions: number };
  }>;
  achievements: Array<{
    id: string;
    unlockedAt: Date;
    achievement: { title: string; icon: string; category: string };
  }>;
}

export function DashboardContent({
  user,
  recentResponses,
  recentQuestionnaires,
  achievements,
}: DashboardContentProps) {
  const xpData = levelProgress(user.xpPoints);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {greeting}, {user.name?.split(" ")[0] || "Trainer"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Keep practicing — every task brings you closer to your next AI training job.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user.streakDays > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-semibold text-orange-400">{user.streakDays} day streak</span>
            </div>
          )}
          <Button variant="gradient" size="sm" asChild>
            <Link href="/practice">
              <Play className="h-4 w-4" />
              Practice now
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* XP Level Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="gradient" className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl bg-brand-600 flex items-center justify-center shadow-orange">
                  <span className="text-xl font-bold text-white">{xpData.level}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">Level {xpData.level}</p>
                    <Badge variant="default" className="text-xs">AI Trainer</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user.xpPoints.toLocaleString()} total XP
                  </p>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    Progress to Level {xpData.level + 1}
                  </span>
                  <span className="text-xs font-medium">
                    {xpData.currentXP}/{xpData.neededXP} XP
                  </span>
                </div>
                <Progress value={xpData.percent} gradient className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Readiness + Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid md:grid-cols-3 gap-4"
      >
        {/* Readiness score */}
        <div className="md:col-span-1 p-5 rounded-2xl border border-brand-200 bg-brand-50">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-semibold">Qualification Readiness</span>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="8" className="text-stone-200" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - 0.34)}`}
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EA5504" />
                    <stop offset="100%" stopColor="#F97316" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">34%</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Complete more tracks to increase readiness</p>
              <Button variant="gradient" size="sm" asChild>
                <Link href="/tracks"><TrendingUp className="h-3 w-3" /> Improve</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          {[
            { href: "/practice",    icon: Play,         label: "Practice a task",   desc: "Jump into a task now" },
            { href: "/exams",       icon: GraduationCap,label: "Take a mock exam",  desc: "Timed qualification test" },
            { href: "/tracks",      icon: BookOpen,     label: "Browse tracks",     desc: "Explore all 20 tracks" },
            { href: "/leaderboard", icon: Trophy,       label: "Leaderboard",       desc: "See where you rank" },
          ].map(({ href, icon: Icon, label, desc }) => (
            <Link key={href} href={href} className="group p-4 rounded-xl border border-border bg-white hover:border-brand-300 hover:shadow-card transition-all">
              <div className="w-8 h-8 rounded-md bg-stone-100 border border-border flex items-center justify-center mb-2 group-hover:bg-brand-50 group-hover:border-brand-200 transition-colors">
                <Icon className="h-4 w-4 text-stone-500 group-hover:text-brand-600 transition-colors" />
              </div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Track progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Your training tracks</h2>
          <Link href="/tracks" className="text-sm text-primary hover:underline flex items-center gap-1">
            All tracks <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TRAINING_TRACKS.slice(0, 4).map((track) => {
            const colors = TRACK_COLOR_MAP[track.color] ?? TRACK_COLOR_MAP.violet;
            return (
              <Link key={track.slug} href={`/tracks/${track.slug}`}
                className="group p-4 rounded-xl border border-border bg-white hover:border-brand-300 hover:shadow-card transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{track.icon}</span>
                  <span className="text-sm font-medium truncate">{track.name}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0 tasks done</span>
                    <span className={colors.text}>0%</span>
                  </div>
                  <Progress value={0} className="h-1.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Responses"
          value={user.totalResponses.toLocaleString()}
          icon={CheckCircle}
          iconColor="text-green-400"
          iconBg="bg-green-500/10 border-green-500/20"
          trend={12}
          delay={0.05}
        />
        <StatsCard
          title="Questionnaires"
          value={recentQuestionnaires.length}
          icon={FileQuestion}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10 border-blue-500/20"
          trend={8}
          delay={0.1}
        />
        <StatsCard
          title="Quality Score"
          value={user.avgQualityScore ? `${Math.round(user.avgQualityScore)}%` : "N/A"}
          icon={Star}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/20"
          trend={3}
          delay={0.15}
        />
        <StatsCard
          title="XP Points"
          value={user.xpPoints.toLocaleString()}
          icon={Zap}
          iconColor="text-brand-600"
          iconBg="bg-brand-50 border-brand-200"
          trend={22}
          delay={0.2}
        />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent responses */}
          <Card variant="default">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/questionnaires">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {recentResponses.length === 0 ? (
                <EmptyState
                  icon={Brain}
                  title="No responses yet"
                  description="Start answering questionnaires to see your activity here."
                  action={{
                    label: "Browse questionnaires",
                    onClick: () => {},
                  }}
                  size="sm"
                />
              ) : (
                <div className="space-y-3">
                  {recentResponses.map((response) => (
                    <div
                      key={response.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                          response.status === "COMPLETED" ? "bg-green-500/15" : "bg-blue-500/15"
                        )}>
                          {response.status === "COMPLETED" ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <Clock className="h-4 w-4 text-blue-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {response.questionnaire.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelative(response.startedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {response.qualityScore && (
                          <span className="text-xs font-medium text-amber-400">
                            {Math.round(response.qualityScore)}%
                          </span>
                        )}
                        <Badge
                          variant={response.status === "COMPLETED" ? "success" : "info"}
                          className="text-xs"
                        >
                          {response.status === "COMPLETED" ? "Done" : "In progress"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My questionnaires */}
          <Card variant="default">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">My Questionnaires</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/questionnaires">See all <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {recentQuestionnaires.length === 0 ? (
                <EmptyState
                  icon={FileQuestion}
                  title="No questionnaires yet"
                  description="Create your first questionnaire to start collecting AI training data."
                  action={{
                    label: "Create questionnaire",
                    onClick: () => {},
                  }}
                  size="sm"
                />
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {recentQuestionnaires.map((q) => (
                    <Link key={q.id} href={`/questionnaires/${q.id}`}>
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 hover:border-border transition-all cursor-pointer">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium line-clamp-2">{q.title}</p>
                          <Badge
                            variant={q.status === "PUBLISHED" ? "success" : q.status === "DRAFT" ? "secondary" : "warning"}
                            className="text-xs shrink-0"
                          >
                            {q.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{q._count.questions} questions</span>
                          <span>·</span>
                          <span>{q._count.responses} responses</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Quick actions */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-2">
              {[
                { href: "/questionnaires/builder", icon: Sparkles, label: "Create questionnaire", color: "text-brand-600" },
                { href: "/questionnaires", icon: FileQuestion, label: "Browse & answer", color: "text-blue-400" },
                { href: "/analytics", icon: BarChart3, label: "View analytics", color: "text-green-400" },
                { href: "/leaderboard", icon: Trophy, label: "Leaderboard", color: "text-amber-400" },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className={cn("h-8 w-8 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center", action.color)}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent achievements */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {achievements.length === 0 ? (
                <EmptyState
                  icon={Trophy}
                  title="No achievements yet"
                  description="Complete questionnaires to earn your first badge!"
                  size="sm"
                />
              ) : (
                <div className="space-y-3">
                  {achievements.map((ua) => (
                    <div key={ua.id} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl">
                        {ua.achievement.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{ua.achievement.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelative(ua.unlockedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="ghost" size="sm" className="w-full mt-4" asChild>
                <Link href="/profile#achievements">View all achievements</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
