"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Database, Plus, Download, X, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Dataset {
  id: string;
  name: string;
  description: string | null;
  status: string;
  totalEntries: number;
  createdAt: string;
  creator: { id: string; name: string | null } | null;
}

interface Questionnaire {
  id: string;
  title: string;
  totalResponses: number;
}

interface DatasetsContentProps {
  datasets: Dataset[];
  total: number;
  page: number;
  limit: number;
  questionnaires: Questionnaire[];
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-white/40 bg-white/5",
  PROCESSING: "text-yellow-400 bg-yellow-500/10",
  READY: "text-emerald-400 bg-emerald-500/10",
  PUBLISHED: "text-blue-400 bg-blue-500/10",
};

export function DatasetsContent({
  datasets,
  total,
  page,
  limit,
  questionnaires,
}: DatasetsContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedQs, setSelectedQs] = useState<string[]>([]);

  const totalPages = Math.ceil(total / limit);

  async function createDataset() {
    if (!newName.trim() || selectedQs.length === 0) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/datasets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          questionnaireIds: selectedQs,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Dataset created");
      setShowCreate(false);
      setNewName("");
      setNewDesc("");
      setSelectedQs([]);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Failed to create dataset");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Database className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Training Datasets</h1>
            <p className="text-white/40 text-sm">{total} datasets created</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Dataset
        </button>
      </div>

      {/* Dataset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {datasets.map((ds, i) => (
          <motion.div
            key={ds.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl border border-white/10 p-5 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-white text-sm leading-tight">{ds.name}</h3>
              <span className={cn("px-2 py-0.5 rounded text-xs font-medium shrink-0", STATUS_COLORS[ds.status] || STATUS_COLORS.DRAFT)}>
                {ds.status}
              </span>
            </div>
            {ds.description && (
              <p className="text-xs text-white/40 line-clamp-2">{ds.description}</p>
            )}
            <div className="flex items-center justify-between text-xs text-white/30">
              <span>{ds.totalEntries.toLocaleString()} entries</span>
              <span>{new Date(ds.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/30">by {ds.creator?.name || "Unknown"}</span>
              {ds.status === "READY" && (
                <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs transition-colors">
                  <Download className="h-3 w-3" />
                  Export
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {datasets.length === 0 && (
        <div className="text-center py-20 glass-card rounded-2xl border border-white/10">
          <Database className="h-12 w-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/50">No datasets yet</p>
          <p className="text-white/30 text-sm mt-1">Create your first dataset to export training data</p>
        </div>
      )}

      {/* Create Dataset Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 border border-white/15 w-full max-w-lg space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">Create Dataset</h3>
              <button onClick={() => setShowCreate(false)} className="text-white/30 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-white/50">Dataset Name *</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. NLP Sentiment V2"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/50">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  placeholder="Optional description…"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50 resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/50">Select Questionnaires * ({selectedQs.length} selected)</label>
                <div className="max-h-48 overflow-y-auto space-y-1 border border-white/10 rounded-lg p-2">
                  {questionnaires.map((q) => (
                    <label key={q.id} className={cn(
                      "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                      selectedQs.includes(q.id) ? "bg-violet-500/20" : "hover:bg-white/5",
                    )}>
                      <input
                        type="checkbox"
                        checked={selectedQs.includes(q.id)}
                        onChange={(e) =>
                          setSelectedQs((prev) =>
                            e.target.checked ? [...prev, q.id] : prev.filter((id) => id !== q.id),
                          )
                        }
                        className="accent-violet-600"
                      />
                      <span className="text-sm text-white/70 flex-1 truncate">{q.title}</span>
                      <span className="text-xs text-white/30">{q.totalResponses} resp.</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2 rounded-lg bg-white/5 text-white/50 text-sm hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createDataset}
                disabled={creating || !newName.trim() || selectedQs.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {creating ? "Creating…" : "Create Dataset"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
