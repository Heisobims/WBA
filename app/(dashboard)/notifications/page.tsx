"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, CheckCheck, Trophy, Zap, MessageSquare, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  ACHIEVEMENT:       <Trophy className="h-4 w-4 text-yellow-500" />,
  REWARD:            <Zap className="h-4 w-4 text-brand-600" />,
  LEVEL_UP:          <Zap className="h-4 w-4 text-brand-500" />,
  REVIEW_COMPLETE:   <CheckCheck className="h-4 w-4 text-emerald-500" />,
  NEW_QUESTIONNAIRE: <MessageSquare className="h-4 w-4 text-blue-500" />,
  SYSTEM:            <Info className="h-4 w-4 text-muted-foreground" />,
  MODERATION_FLAG:   <AlertCircle className="h-4 w-4 text-red-500" />,
  REMINDER:          <Bell className="h-4 w-4 text-orange-500" />,
  TEAM_INVITE:       <MessageSquare className="h-4 w-4 text-cyan-500" />,
};

const TYPE_BG: Record<string, string> = {
  ACHIEVEMENT:       "bg-yellow-50 border-yellow-200",
  REWARD:            "bg-brand-50 border-brand-200",
  LEVEL_UP:          "bg-brand-50 border-brand-200",
  REVIEW_COMPLETE:   "bg-emerald-50 border-emerald-200",
  NEW_QUESTIONNAIRE: "bg-blue-50 border-blue-200",
  SYSTEM:            "bg-stone-50 border-border",
  MODERATION_FLAG:   "bg-red-50 border-red-200",
  REMINDER:          "bg-orange-50 border-orange-200",
  TEAM_INVITE:       "bg-cyan-50 border-cyan-200",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async (p: number, append = false) => {
    try {
      const res = await fetch(`/api/notifications?page=${p}`);
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => append ? [...prev, ...data.data] : data.data);
        setTotal(data.total);
        setUnreadCount(data.unreadCount);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await fetch("/api/notifications?all=true", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } finally {
      setMarkingAll(false);
    }
  }

  async function markOneRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
  }

  async function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    await fetchNotifications(nextPage, true);
  }

  const hasMore = notifications.length < total;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-brand-600" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-brand-600 text-white text-xs rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{total} total notifications</p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            disabled={markingAll}
            className="flex items-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-muted-foreground hover:text-foreground rounded-lg text-sm transition-colors disabled:opacity-50 border border-border"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </motion.div>

      {/* Notification List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-stone-100 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <BellOff className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No notifications yet</p>
          <p className="text-muted-foreground/60 text-sm mt-1">
            Complete questionnaires and earn XP to see updates here
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => !n.isRead && markOneRead(n.id)}
                className={cn(
                  "flex gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                  TYPE_BG[n.type] || TYPE_BG.SYSTEM,
                  !n.isRead && "ring-1 ring-brand-300",
                  n.isRead && "opacity-60",
                )}
              >
                <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center">
                  {TYPE_ICONS[n.type] || TYPE_ICONS.SYSTEM}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-medium", n.isRead ? "text-muted-foreground" : "text-foreground")}>
                      {n.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground/60">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  <p className={cn("text-xs mt-0.5 leading-relaxed", n.isRead ? "text-muted-foreground/50" : "text-muted-foreground")}>
                    {n.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {hasMore && (
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2 bg-white border border-border hover:bg-stone-50 text-muted-foreground hover:text-foreground rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
