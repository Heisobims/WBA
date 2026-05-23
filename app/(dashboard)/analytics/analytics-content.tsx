"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { CheckCircle, Clock, TrendingDown, Star, BarChart3, FileQuestion } from "lucide-react";
import { cn, formatDate, qualityScoreColor } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnalyticsContentProps {
  stats: {
    totalCompleted: number;
    totalInProgress: number;
    totalAbandoned: number;
    avgQuality: number;
  };
  questionnaires: Array<{
    id: string;
    title: string;
    totalResponses: number;
    completionRate: number | null;
    avgQualityScore: number | null;
    avgCompletionTime: number | null;
    createdAt: Date;
    _count: { responses: number };
  }>;
  recentResponses: Array<{
    id: string;
    qualityScore: number | null;
    timeSpentSeconds: number | null;
    startedAt: Date;
    completedAt: Date | null;
    questionnaire: { title: string; xpReward: number };
  }>;
}

const CHART_COLORS = ["#8b5cf6", "#6366f1", "#06b6d4", "#10b981", "#f59e0b"];

export function AnalyticsContent({ stats, questionnaires, recentResponses }: AnalyticsContentProps) {
  const total = stats.totalCompleted + stats.totalInProgress + stats.totalAbandoned;

  // Build daily activity data (last 14 days)
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    return date.toISOString().split("T")[0];
  });

  const activityData = last14Days.map((day) => {
    const dayResponses = recentResponses.filter(
      (r) => r.completedAt?.toISOString().split("T")[0] === day,
    );
    return {
      date: day.slice(5),
      responses: dayResponses.length,
      quality: dayResponses.length > 0
        ? Math.round(dayResponses.reduce((s, r) => s + (r.qualityScore || 0), 0) / dayResponses.length)
        : 0,
    };
  });

  const pieData = [
    { name: "Completed", value: stats.totalCompleted, color: "#10b981" },
    { name: "In Progress", value: stats.totalInProgress, color: "#6366f1" },
    { name: "Abandoned", value: stats.totalAbandoned, color: "#f43f5e" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold mb-1">Analytics</h1>
        <p className="text-muted-foreground text-sm">Track your performance and data quality</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Completed Responses"
          value={stats.totalCompleted.toLocaleString()}
          icon={CheckCircle}
          iconColor="text-green-400"
          iconBg="bg-green-500/10 border-green-500/20"
          delay={0.05}
        />
        <StatsCard
          title="In Progress"
          value={stats.totalInProgress.toLocaleString()}
          icon={Clock}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10 border-blue-500/20"
          delay={0.1}
        />
        <StatsCard
          title="Abandoned"
          value={stats.totalAbandoned.toLocaleString()}
          icon={TrendingDown}
          iconColor="text-red-400"
          iconBg="bg-red-500/10 border-red-500/20"
          delay={0.15}
        />
        <StatsCard
          title="Avg Quality Score"
          value={`${Math.round(stats.avgQuality)}%`}
          icon={Star}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/20"
          delay={0.2}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-base">Response Activity (14 days)</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={activityData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="responses"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#colorResponses)"
                    name="Responses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Response distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-base">Response Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {total > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {pieData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  No data yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Questionnaire performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="default">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileQuestion className="h-4 w-4 text-primary" />
              Questionnaire Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {questionnaires.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                No questionnaires created yet
              </div>
            ) : (
              <div className="space-y-4">
                {questionnaires.map((q) => (
                  <div key={q.id} className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{q.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{q._count.responses} responses</span>
                        {q.avgQualityScore && (
                          <span className={qualityScoreColor(q.avgQualityScore)}>
                            {Math.round(q.avgQualityScore)}% quality
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-32">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Completion</span>
                        <span>{Math.round((q.completionRate || 0) * 100)}%</span>
                      </div>
                      <Progress
                        value={(q.completionRate || 0) * 100}
                        gradient
                        className="h-1.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
