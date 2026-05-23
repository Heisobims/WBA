"use client";

import { useState, useCallback, useEffect } from "react";
import { useBuilderStore } from "@/store/questionnaire-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, arrayMove
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionCard } from "./question-card";
import { QuestionTypePanel } from "./question-type-panel";
import { QuestionEditor } from "./question-editor";
import { BuilderSettings } from "./builder-settings";
import { BuilderPreview } from "./builder-preview";
import { AIGenerateModal } from "./ai-generate-modal";
import {
  Save, Eye, Settings, Sparkles, ArrowLeft, Share2, Zap,
  Plus, CheckCircle, AlertCircle, Clock
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface QuestionnaireBuilderProps {
  userId: string;
  questionnaireId?: string;
}

export function QuestionnaireBuilder({ userId, questionnaireId }: QuestionnaireBuilderProps) {
  const {
    title, questions, activeQuestionId, isDirty, isSaving,
    previewMode, setField, setIsSaving, setIsDirty, setLastSaved,
    togglePreviewMode, reorderQuestions, questionnaireId: storeId,
  } = useBuilderStore();

  const [activeTab, setActiveTab] = useState<"questions" | "settings">("questions");
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      reorderQuestions(oldIndex, newIndex);
    },
    [questions, reorderQuestions],
  );

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    setIsSaving(true);

    try {
      const storeState = useBuilderStore.getState();
      const method = storeState.questionnaireId ? "PUT" : "POST";
      const url = storeState.questionnaireId
        ? `/api/questionnaires/${storeState.questionnaireId}`
        : "/api/questionnaires";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: storeState.title,
          description: storeState.description,
          category: storeState.category,
          tags: storeState.tags,
          status: storeState.status,
          isPublic: storeState.isPublic,
          requireAuth: storeState.requireAuth,
          randomizeOrder: storeState.randomizeOrder,
          showProgress: storeState.showProgress,
          allowResume: storeState.allowResume,
          timeLimit: storeState.timeLimit,
          estimatedTime: storeState.estimatedTime,
          maxAttempts: storeState.maxAttempts,
          aiEnabled: storeState.aiEnabled,
          adaptiveEnabled: storeState.adaptiveEnabled,
          xpReward: storeState.xpReward,
          difficulty: storeState.difficulty,
          questions: storeState.questions,
        }),
      });

      if (!response.ok) throw new Error("Save failed");

      const data = await response.json();
      if (!storeState.questionnaireId && data.data?.id) {
        useBuilderStore.setState({ questionnaireId: data.data.id });
      }

      setSaveStatus("saved");
      setIsDirty(false);
      setLastSaved(new Date());
      toast.success("Questionnaire saved!");
    } catch {
      setSaveStatus("error");
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [setIsSaving, setIsDirty, setLastSaved]);

  // Auto-save every 30 seconds when dirty
  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(handleSave, 30000);
    return () => clearTimeout(timer);
  }, [isDirty, handleSave]);

  if (previewMode) {
    return <BuilderPreview onClose={togglePreviewMode} />;
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      {/* Builder Header */}
      <div className="flex items-center gap-3 h-14 px-4 border-b border-border/50 bg-card/50 backdrop-blur-sm shrink-0">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/questionnaires">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div className="flex-1 min-w-0">
          <Input
            value={title}
            onChange={(e) => setField("title", e.target.value)}
            className="border-0 bg-transparent text-lg font-semibold px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Untitled Questionnaire"
          />
        </div>

        {/* Save status */}
        <div className="flex items-center gap-1.5 text-xs">
          {saveStatus === "saving" && (
            <>
              <Clock className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
              <span className="text-muted-foreground">Saving...</span>
            </>
          )}
          {saveStatus === "saved" && !isDirty && (
            <>
              <CheckCircle className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">Saved</span>
            </>
          )}
          {isDirty && saveStatus !== "saving" && (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-amber-400">Unsaved</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAiModalOpen(true)}
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            AI Generate
          </Button>

          <Button variant="ghost" size="icon-sm" onClick={togglePreviewMode}>
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            variant="gradient"
            size="sm"
            onClick={handleSave}
            loading={isSaving}
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </div>

      {/* Builder Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Question types */}
        <div className="w-64 shrink-0 border-r border-border/50 overflow-y-auto bg-card/30">
          <div className="p-3 border-b border-border/50">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("questions")}
                className={cn(
                  "flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  activeTab === "questions" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                Questions
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={cn(
                  "flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  activeTab === "settings" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                Settings
              </button>
            </div>
          </div>
          {activeTab === "questions" ? (
            <QuestionTypePanel />
          ) : (
            <BuilderSettings />
          )}
        </div>

        {/* Center: Question list */}
        <div className="flex-1 overflow-y-auto p-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="max-w-2xl mx-auto space-y-3">
                {questions.length === 0 ? (
                  <div className="text-center py-24">
                    <div className="h-16 w-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">Add your first question</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose a question type from the left panel, or let AI generate questions for you.
                    </p>
                    <Button
                      variant="gradient"
                      onClick={() => setAiModalOpen(true)}
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate with AI
                    </Button>
                  </div>
                ) : (
                  <>
                    {questions.map((question, index) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        index={index}
                        isActive={activeQuestionId === question.id}
                      />
                    ))}
                    <Button
                      variant="ghost"
                      className="w-full border-2 border-dashed border-border/50 hover:border-primary/50 h-12 text-muted-foreground hover:text-primary"
                      onClick={() => setAiModalOpen(true)}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Add question or generate with AI
                    </Button>
                  </>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Right: Question editor */}
        <AnimatePresence>
          {activeQuestionId && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-80 shrink-0 border-l border-border/50 overflow-y-auto bg-card/30"
            >
              <QuestionEditor questionId={activeQuestionId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-4 px-4 h-10 border-t border-border/50 bg-card/30 text-xs text-muted-foreground shrink-0">
        <span>{questions.length} questions</span>
        <span>·</span>
        <span>
          ~{Math.max(1, Math.ceil(questions.length * 1.5))} min estimated
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-violet-400" />
          {useBuilderStore.getState().xpReward} XP reward
        </span>
      </div>

      {/* AI Generate Modal */}
      <AIGenerateModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />
    </div>
  );
}
