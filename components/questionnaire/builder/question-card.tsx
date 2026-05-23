"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBuilderStore } from "@/store/questionnaire-store";
import { getQuestionTypeConfig } from "@/components/questionnaire/question-type-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  GripVertical, Trash2, Copy, ChevronUp, ChevronDown, Clock, Zap
} from "lucide-react";
import type { QuestionBuilderItem } from "@/types";
import { motion } from "framer-motion";

interface QuestionCardProps {
  question: QuestionBuilderItem;
  index: number;
  isActive: boolean;
}

export function QuestionCard({ question, index, isActive }: QuestionCardProps) {
  const { setActiveQuestion, removeQuestion, duplicateQuestion } = useBuilderStore();
  const typeConfig = getQuestionTypeConfig(question.type);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative rounded-2xl border transition-all duration-200 cursor-pointer",
        isActive
          ? "border-primary/50 bg-primary/5 shadow-sm shadow-primary/10"
          : "border-border/50 bg-card hover:border-border hover:shadow-sm",
        isDragging && "opacity-50 scale-[0.98]",
      )}
      onClick={() => setActiveQuestion(question.id)}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Drag handle */}
        <button
          className="drag-handle mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Question number */}
        <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center text-xs font-bold shrink-0">
          {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {typeConfig && (
              <div
                className={cn(
                  "h-5 w-5 rounded-md bg-gradient-to-br flex items-center justify-center shrink-0",
                  typeConfig.color,
                )}
              >
                <typeConfig.icon className="h-2.5 w-2.5 text-white" />
              </div>
            )}
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {typeConfig?.label || question.type}
            </Badge>
            {question.isRequired && (
              <span className="text-[10px] text-red-400">*</span>
            )}
            {question.timeLimit && (
              <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Clock className="h-2.5 w-2.5" />
                {question.timeLimit}s
              </div>
            )}
          </div>

          <p className={cn(
            "text-sm font-medium line-clamp-2",
            !question.title && "text-muted-foreground italic",
          )}>
            {question.title || "Untitled question"}
          </p>

          {question.options && question.options.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {question.options.length} options
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              duplicateQuestion(question.id);
            }}
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              removeQuestion(question.id);
            }}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-primary rounded-r-full" />
      )}
    </motion.div>
  );
}
