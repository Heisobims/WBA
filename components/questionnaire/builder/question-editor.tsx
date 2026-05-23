"use client";

import { useBuilderStore } from "@/store/questionnaire-store";
import { getQuestionTypeConfig } from "@/components/questionnaire/question-type-config";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch-ui";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash2, X, GripVertical, Check } from "lucide-react";
import type { QuestionBuilderItem, QuestionOption } from "@/types";

interface QuestionEditorProps {
  questionId: string;
}

export function QuestionEditor({ questionId }: QuestionEditorProps) {
  const { questions, updateQuestion, setActiveQuestion } = useBuilderStore();
  const question = questions.find((q) => q.id === questionId);

  if (!question) return null;

  const typeConfig = getQuestionTypeConfig(question.type);

  const update = (updates: Partial<QuestionBuilderItem>) => {
    updateQuestion(questionId, updates);
  };

  const addOption = () => {
    const options = [...(question.options || [])];
    options.push({ id: uuidv4(), text: `Option ${options.length + 1}`, isCorrect: false });
    update({ options });
  };

  const removeOption = (optionId: string) => {
    update({ options: question.options?.filter((o) => o.id !== optionId) || [] });
  };

  const updateOption = (optionId: string, updates: Partial<QuestionOption>) => {
    update({
      options: question.options?.map((o) => (o.id === optionId ? { ...o, ...updates } : o)) || [],
    });
  };

  const toggleCorrect = (optionId: string) => {
    if (question.type === "SINGLE_CHOICE") {
      update({
        options: question.options?.map((o) => ({
          ...o,
          isCorrect: o.id === optionId,
        })) || [],
      });
    } else {
      update({
        options: question.options?.map((o) =>
          o.id === optionId ? { ...o, isCorrect: !o.isCorrect } : o,
        ) || [],
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {typeConfig && (
            <div className={cn("h-6 w-6 rounded-lg bg-gradient-to-br flex items-center justify-center", typeConfig.color)}>
              <typeConfig.icon className="h-3 w-3 text-white" />
            </div>
          )}
          <span className="text-xs font-semibold text-muted-foreground">{typeConfig?.label}</span>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={() => setActiveQuestion(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Question title */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Question text *</label>
        <Textarea
          value={question.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Enter your question..."
          rows={3}
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Helper text (optional)</label>
        <Input
          value={question.description || ""}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Add additional context..."
        />
      </div>

      {/* Options editor */}
      {typeConfig?.supportsOptions && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Options
            {typeConfig.supportsScoring && (
              <span className="text-muted-foreground/60 ml-1">(click to mark correct)</span>
            )}
          </label>
          <div className="space-y-2">
            {(question.options || []).map((option, i) => (
              <div key={option.id} className="flex items-center gap-2">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0 cursor-grab" />
                {typeConfig.supportsScoring && (
                  <button
                    onClick={() => toggleCorrect(option.id)}
                    className={cn(
                      "h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors",
                      option.isCorrect
                        ? "bg-green-500 border-green-500"
                        : "border-border hover:border-primary",
                    )}
                  >
                    {option.isCorrect && <Check className="h-2.5 w-2.5 text-white" />}
                  </button>
                )}
                <Input
                  value={option.text}
                  onChange={(e) => updateOption(option.id, { text: e.target.value })}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 h-8 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => removeOption(option.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-2 border border-dashed border-border/50" onClick={addOption}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add option
          </Button>
        </div>
      )}

      {/* Numeric range */}
      {typeConfig?.hasNumericRange && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Min value</label>
            <Input
              type="number"
              value={question.minValue != null ? Number(question.minValue) : ""}
              onChange={(e) => update({ minValue: Number(e.target.value) })}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Max value</label>
            <Input
              type="number"
              value={question.maxValue != null ? Number(question.maxValue) : ""}
              onChange={(e) => update({ maxValue: Number(e.target.value) })}
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}

      {/* Code language */}
      {question.type === "CODE_EDITOR" && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Language</label>
          <select
            value={String(question.codeLanguage || "javascript")}
            onChange={(e) => update({ codeLanguage: e.target.value })}
            className="w-full h-8 text-sm rounded-lg border border-input bg-background px-2"
          >
            {["javascript", "typescript", "python", "java", "cpp", "rust", "go", "sql"].map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      )}

      {/* Settings */}
      <div className="space-y-3 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium">Required</p>
            <p className="text-[10px] text-muted-foreground">Users must answer this question</p>
          </div>
          <Switch
            checked={question.isRequired}
            onCheckedChange={(v) => update({ isRequired: v })}
          />
        </div>

        {typeConfig?.supportsScoring && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Enable scoring</p>
              <p className="text-[10px] text-muted-foreground">Score this question automatically</p>
            </div>
            <Switch
              checked={question.scoringEnabled}
              onCheckedChange={(v) => update({ scoringEnabled: v })}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium">AI follow-up</p>
            <p className="text-[10px] text-muted-foreground">Generate adaptive follow-up question</p>
          </div>
          <Switch
            checked={question.aiFollowUp}
            onCheckedChange={(v) => update({ aiFollowUp: v })}
          />
        </div>

        {/* Time limit */}
        <div>
          <label className="text-xs font-medium mb-1.5 block">
            Time limit (seconds, 0 = none)
          </label>
          <Input
            type="number"
            value={question.timeLimit ?? ""}
            onChange={(e) =>
              update({ timeLimit: e.target.value ? Number(e.target.value) : null })
            }
            placeholder="No limit"
            className="h-8 text-sm"
            min={0}
          />
        </div>
      </div>
    </div>
  );
}
