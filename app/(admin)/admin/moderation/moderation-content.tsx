"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, CheckCircle2, XCircle, User, FileQuestion, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FlaggedResponse {
  id: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
  questionnaire: { id: string; title: string } | null;
  answers: Array<{
    id: string;
    textValue: string | null;
    question: { title: string; type: string } | null;
  }>;
}

interface ModerationContentProps {
  responses: FlaggedResponse[];
  total: number;
  page: number;
  limit: number;
}

export function ModerationContent({ responses, total, page, limit }: ModerationContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  async function handleAction(responseId: string, action: "APPROVE" | "REJECT") {
    setActioning(responseId);
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseId, action }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(action === "APPROVE" ? "Response approved" : "Response rejected");
      startTransition(() => router.refresh());
    } catch {
      toast.error("Action failed");
    } finally {
      setActioning(null);
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
          <Flag className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Content Moderation</h1>
          <p className="text-white/40 text-sm">{total} flagged responses requiring review</p>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl border border-white/10">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-white font-semibold">All clear!</p>
          <p className="text-white/40 text-sm mt-1">No flagged responses to review</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {responses.map((response, i) => (
              <motion.div
                key={response.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl border border-red-500/20 overflow-hidden"
              >
                {/* Response Header */}
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1.5 text-white/60">
                        <User className="h-3.5 w-3.5" />
                        {response.user?.name || response.user?.email || "Unknown user"}
                      </span>
                      <span className="text-white/20">·</span>
                      <span className="flex items-center gap-1.5 text-white/60">
                        <FileQuestion className="h-3.5 w-3.5" />
                        {response.questionnaire?.title || "Unknown questionnaire"}
                      </span>
                    </div>
                    <p className="text-xs text-white/30">
                      {new Date(response.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(response.id, "APPROVE")}
                      disabled={actioning === response.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-medium transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(response.id, "REJECT")}
                      disabled={actioning === response.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium transition-all disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => setExpanded(expanded === response.id ? null : response.id)}
                      className="p-1.5 text-white/30 hover:text-white transition-colors"
                    >
                      {expanded === response.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded answers */}
                <AnimatePresence>
                  {expanded === response.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 overflow-hidden"
                    >
                      <div className="p-4 space-y-3">
                        {response.answers.map((answer) => (
                          <div key={answer.id} className="space-y-1">
                            <p className="text-xs text-white/40 font-medium">
                              {answer.question?.title || "Question"}
                            </p>
                            <p className={cn(
                              "text-sm p-3 rounded-lg bg-white/5 border border-white/5",
                              answer.textValue ? "text-white/70" : "text-white/20 italic"
                            )}>
                              {answer.textValue || "(no text response)"}
                            </p>
                          </div>
                        ))}
                        {response.answers.length === 0 && (
                          <p className="text-sm text-white/30 italic">No answer details available</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => router.push(`?page=${page - 1}`)}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-sm disabled:opacity-30 transition-colors"
          >
            Previous
          </button>
          <span className="text-white/40 text-sm">{page} / {totalPages}</span>
          <button
            onClick={() => router.push(`?page=${page + 1}`)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-sm disabled:opacity-30 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
