"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateQuestionsSchema, type GenerateQuestionsInput } from "@/lib/validations";
import { useBuilderStore } from "@/store/questionnaire-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { QUESTION_TYPES } from "@/components/questionnaire/question-type-config";
import { Sparkles, X, Brain, Zap, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AIGenerateModalProps {
  open: boolean;
  onClose: () => void;
}

export function AIGenerateModal({ open, onClose }: AIGenerateModalProps) {
  const [generating, setGenerating] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const { addQuestion } = useBuilderStore();

  const { register, handleSubmit, formState: { errors } } = useForm<GenerateQuestionsInput>({
    resolver: zodResolver(generateQuestionsSchema),
    defaultValues: { count: 5, difficulty: 3 },
  });

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const onSubmit = async (data: GenerateQuestionsInput) => {
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, types: selectedTypes.length > 0 ? selectedTypes : undefined }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const { data: questions } = await response.json();

      if (!questions?.length) {
        toast.error("No questions generated. Try different parameters.");
        return;
      }

      questions.forEach((q: { type: string; title: string; options?: unknown[] }) => {
        const type = q.type || "TEXT_SHORT";
        addQuestion(type);
        const store = useBuilderStore.getState();
        const lastQuestion = store.questions[store.questions.length - 1];
        if (lastQuestion) {
          useBuilderStore.getState().updateQuestion(lastQuestion.id, {
            title: q.title,
            options: (q.options || []) as import("@/types").QuestionOption[],
          });
        }
      });

      toast.success(`Generated ${questions.length} questions!`);
      onClose();
    } catch {
      toast.error("AI generation failed. Check your API key.");
    } finally {
      setGenerating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-card border border-border/50 rounded-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold">AI Question Generator</h2>
              <p className="text-xs text-muted-foreground">GPT-4o powered</p>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Topic *</label>
            <Input
              {...register("topic")}
              placeholder="e.g., Machine learning ethics, Code reasoning..."
              error={errors.topic?.message}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Category *</label>
            <Input
              {...register("category")}
              placeholder="e.g., NLP, Computer Vision, Reasoning..."
              error={errors.category?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Count</label>
              <Input
                {...register("count", { valueAsNumber: true })}
                type="number"
                min={1}
                max={20}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Difficulty (1-5)</label>
              <Input
                {...register("difficulty", { valueAsNumber: true })}
                type="number"
                min={1}
                max={5}
                className="h-9"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Question types (optional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUESTION_TYPES.slice(0, 12).map((qt) => (
                <button
                  key={qt.type}
                  type="button"
                  onClick={() => toggleType(qt.type)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                    selectedTypes.includes(qt.type)
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "border-border/50 text-muted-foreground hover:border-border",
                  )}
                >
                  {selectedTypes.includes(qt.type) && <Check className="h-3 w-3 inline mr-1" />}
                  {qt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Additional context (optional)</label>
            <Textarea
              {...register("context")}
              placeholder="Provide context, domain knowledge, or specific requirements..."
              rows={2}
            />
          </div>

          <Button type="submit" variant="gradient" className="w-full" loading={generating}>
            <Sparkles className="h-4 w-4" />
            {generating ? "Generating with GPT-4o..." : "Generate questions"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
