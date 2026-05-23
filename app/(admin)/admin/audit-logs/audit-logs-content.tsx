"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
  newData: any;
}

interface AuditLogsContentProps {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "text-emerald-400 bg-emerald-500/10",
  UPDATE: "text-blue-400 bg-blue-500/10",
  DELETE: "text-red-400 bg-red-500/10",
  SUSPEND: "text-orange-400 bg-orange-500/10",
  APPROVE: "text-emerald-400 bg-emerald-500/10",
  REJECT: "text-red-400 bg-red-500/10",
  LOGIN: "text-violet-400 bg-violet-500/10",
  LOGOUT: "text-white/40 bg-white/5",
};

const ACTIONS = ["CREATE", "UPDATE", "DELETE", "SUSPEND", "APPROVE", "REJECT", "LOGIN", "LOGOUT"];
const RESOURCES = ["user", "questionnaire", "response", "dataset", "session"];

export function AuditLogsContent({ logs, total, page, limit }: AuditLogsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);

  function navigate(params: Record<string, string>) {
    const p = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k));
    router.push(`?${p.toString()}`);
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Activity className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Audit Log</h1>
            <p className="text-white/40 text-sm">{total.toLocaleString()} events recorded</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-white/30" />
        <select
          defaultValue={searchParams.get("action") || ""}
          onChange={(e) => navigate({ action: e.target.value, page: "1" })}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 text-sm focus:outline-none"
        >
          <option value="">All Actions</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select
          defaultValue={searchParams.get("resource") || ""}
          onChange={(e) => navigate({ resource: e.target.value, page: "1" })}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 text-sm focus:outline-none"
        >
          <option value="">All Resources</option>
          {RESOURCES.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
        </select>
      </div>

      {/* Log Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Time", "Actor", "Action", "Resource", "Resource ID", "Details"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-white/30 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white/60 text-sm">{log.user?.name || "System"}</p>
                    <p className="text-white/25 text-xs">{log.user?.email || ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-0.5 rounded text-xs font-bold uppercase", ACTION_COLORS[log.action] || ACTION_COLORS.UPDATE)}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-sm capitalize">{log.resource}</td>
                  <td className="px-4 py-3 text-white/30 text-xs font-mono">
                    {log.resourceId ? log.resourceId.slice(0, 8) + "…" : "—"}
                  </td>
                  <td className="px-4 py-3 text-white/30 text-xs max-w-[200px]">
                    {log.newData ? (
                      <span className="font-mono truncate block">
                        {JSON.stringify(log.newData).slice(0, 60)}
                      </span>
                    ) : "—"}
                  </td>
                </motion.tr>
              ))}
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
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs disabled:opacity-30">
                Prev
              </button>
              <span className="text-xs text-white/40">{page}/{totalPages}</span>
              <button onClick={() => navigate({ page: String(page + 1) })} disabled={page >= totalPages}
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs disabled:opacity-30">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
