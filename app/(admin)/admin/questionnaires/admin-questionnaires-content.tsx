"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FileQuestion, Search, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AdminQuestionnaire {
  id: string;
  title: string;
  status: string;
  category: string | null;
  createdAt: string;
  creator: { id: string; name: string | null; email: string } | null;
  _count: { questions: number; responses: number };
}

interface AdminQuestionnairesContentProps {
  questionnaires: AdminQuestionnaire[];
  total: number;
  page: number;
  limit: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT: { label: "Draft", color: "text-white/40 bg-white/5", icon: <Clock className="h-3 w-3" /> },
  PUBLISHED: { label: "Published", color: "text-emerald-400 bg-emerald-500/10", icon: <CheckCircle className="h-3 w-3" /> },
  ARCHIVED: { label: "Archived", color: "text-orange-400 bg-orange-500/10", icon: <XCircle className="h-3 w-3" /> },
  PENDING_REVIEW: { label: "Pending", color: "text-yellow-400 bg-yellow-500/10", icon: <Clock className="h-3 w-3" /> },
};

export function AdminQuestionnairesContent({
  questionnaires,
  total,
  page,
  limit,
}: AdminQuestionnairesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/questionnaires", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(`Status updated to ${status}`);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdating(null);
    }
  }

  const totalPages = Math.ceil(total / limit);

  function navigate(params: Record<string, string>) {
    const p = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k));
    router.push(`?${p.toString()}`);
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <FileQuestion className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Questionnaires</h1>
            <p className="text-white/40 text-sm">{total.toLocaleString()} total</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            defaultValue={searchParams.get("search") || ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate({ search: (e.target as HTMLInputElement).value, page: "1" });
            }}
            placeholder="Search questionnaires…"
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder:text-white/20"
          />
        </div>
        <select
          defaultValue={searchParams.get("status") || ""}
          onChange={(e) => navigate({ status: e.target.value, page: "1" })}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 text-sm focus:outline-none"
        >
          <option value="">All Statuses</option>
          {Object.keys(STATUS_CONFIG).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Title", "Creator", "Status", "Questions", "Responses", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-white/30 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {questionnaires.map((q, i) => {
                const statusConf = STATUS_CONFIG[q.status] || STATUS_CONFIG.DRAFT;
                return (
                  <motion.tr
                    key={q.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-white text-sm font-medium line-clamp-1">{q.title}</p>
                      {q.category && <p className="text-white/30 text-xs mt-0.5">{q.category}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white/60 text-sm">{q.creator?.name || "—"}</p>
                      <p className="text-white/30 text-xs">{q.creator?.email || ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium", statusConf.color)}>
                        {statusConf.icon}
                        {statusConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/50 text-sm">{q._count.questions}</td>
                    <td className="px-4 py-3 text-white/50 text-sm">{q._count.responses.toLocaleString()}</td>
                    <td className="px-4 py-3 text-white/30 text-xs">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/questionnaires/play/${q.id}`}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                          title="Preview"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        {q.status !== "PUBLISHED" && (
                          <button
                            onClick={() => updateStatus(q.id, "PUBLISHED")}
                            disabled={updating === q.id}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-white/30 hover:text-emerald-400 transition-colors disabled:opacity-50"
                            title="Publish"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {q.status === "PUBLISHED" && (
                          <button
                            onClick={() => updateStatus(q.id, "ARCHIVED")}
                            disabled={updating === q.id}
                            className="p-1.5 rounded-lg hover:bg-orange-500/20 text-white/30 hover:text-orange-400 transition-colors disabled:opacity-50"
                            title="Archive"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-white/30">
              {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate({ page: String(page - 1) })} disabled={page === 1}
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs disabled:opacity-30 transition-colors">
                Prev
              </button>
              <span className="text-xs text-white/40">{page}/{totalPages}</span>
              <button onClick={() => navigate({ page: String(page + 1) })} disabled={page >= totalPages}
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs disabled:opacity-30 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
