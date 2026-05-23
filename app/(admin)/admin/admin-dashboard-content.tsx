"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ROLE_COLORS, STATUS_COLORS, formatRelative } from "@/lib/utils";
import {
  Users, FileQuestion, BarChart3, AlertTriangle, Shield,
  UserPlus, Activity, Database, ArrowRight, Eye, Flag
} from "lucide-react";

interface AdminDashboardContentProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    totalQuestionnaires: number;
    publishedQuestionnaires: number;
    totalResponses: number;
    responsesToday: number;
    pendingModeration: number;
    flaggedResponses: number;
  };
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
    status: string;
    createdAt: Date;
  }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    resource: string;
    createdAt: Date;
    user: { name: string | null; email: string | null } | null;
  }>;
}

export function AdminDashboardContent({ stats, recentUsers, recentAuditLogs }: AdminDashboardContentProps) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">System overview and management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/users"><Users className="h-4 w-4 mr-1" />Users</Link>
          </Button>
          <Button variant="gradient" size="sm" asChild>
            <Link href="/admin/moderation"><Flag className="h-4 w-4 mr-1" />Moderation</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users}
          iconColor="text-blue-400" iconBg="bg-blue-500/10 border-blue-500/20"
          trend={Math.round((stats.newUsersToday / Math.max(stats.totalUsers, 1)) * 100)} delay={0.05} />
        <StatsCard title="Questionnaires" value={stats.totalQuestionnaires.toLocaleString()} icon={FileQuestion}
          iconColor="text-violet-400" iconBg="bg-violet-500/10 border-violet-500/20" delay={0.1} />
        <StatsCard title="Total Responses" value={stats.totalResponses.toLocaleString()} icon={BarChart3}
          iconColor="text-green-400" iconBg="bg-green-500/10 border-green-500/20" delay={0.15} />
        <StatsCard title="Flagged Items" value={stats.flaggedResponses.toLocaleString()} icon={AlertTriangle}
          iconColor="text-red-400" iconBg="bg-red-500/10 border-red-500/20" delay={0.2} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Users", value: stats.activeUsers, sub: "of total" },
          { label: "New Today", value: stats.newUsersToday, sub: "users" },
          { label: "Published", value: stats.publishedQuestionnaires, sub: "questionnaires" },
          { label: "Responses Today", value: stats.responsesToday, sub: "submissions" },
        ].map((item, i) => (
          <Card key={item.label} variant="default">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{item.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{item.label} {item.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert if pending moderation */}
      {stats.pendingModeration > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-400">Moderation Required</p>
              <p className="text-sm text-muted-foreground">
                {stats.pendingModeration} flagged responses need review
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/moderation">Review now <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
          </Button>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card variant="default">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Recent Users
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback name={user.name || user.email || ""} />
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{user.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={`text-xs border ${ROLE_COLORS[user.role]}`}>
                    {user.role.replace("_", " ")}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatRelative(user.createdAt)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Audit Log */}
        <Card variant="default">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Audit Log
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/audit-logs">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            {recentAuditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{log.action}</Badge>
                    <span className="text-xs text-muted-foreground truncate">{log.resource}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {log.user?.name || log.user?.email || "System"}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatRelative(log.createdAt)}
                </span>
              </div>
            ))}
            {recentAuditLogs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/admin/users", icon: Users, label: "Manage Users", desc: "Roles, permissions, bans" },
          { href: "/admin/questionnaires", icon: FileQuestion, label: "Questionnaires", desc: "Review and publish" },
          { href: "/admin/moderation", icon: Flag, label: "Moderation", desc: "Flagged responses" },
          { href: "/admin/datasets", icon: Database, label: "Datasets", desc: "Export training data" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card variant="default" hover="lift" className="cursor-pointer">
              <CardContent className="p-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
