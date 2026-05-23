"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Clock, Volume2, Mic, MicOff, CheckCircle, Code as CodeIcon, Star } from "lucide-react";
import type { QuestionBuilderItem } from "@/types";
import type { AnswerValue } from "@/types";

interface QuestionPlayerProps {
  question: QuestionBuilderItem;
  onAnswer: (answer: AnswerValue) => void;
  previewMode?: boolean;
  currentAnswer?: AnswerValue;
}

export function QuestionPlayer({
  question,
  onAnswer,
  previewMode = false,
  currentAnswer,
}: QuestionPlayerProps) {
  const [localAnswer, setLocalAnswer] = useState<AnswerValue>(currentAnswer || {});
  const [timeLeft, setTimeLeft] = useState(question.timeLimit || null);
  const [isRecording, setIsRecording] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLocalAnswer(currentAnswer || {});
  }, [question.id]);

  // Timer
  useEffect(() => {
    if (!question.timeLimit) return;
    setTimeLeft(question.timeLimit);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (!previewMode) onAnswer(localAnswer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [question.id, question.timeLimit]);

  const handleTextChange = (value: string) => {
    const updated = { ...localAnswer, textValue: value };
    setLocalAnswer(updated);
    if (!previewMode) onAnswer(updated);
  };

  const handleOptionToggle = (optionId: string) => {
    const isMultiple = question.type === "MULTIPLE_CHOICE";
    let arrayValue: string[];

    if (isMultiple) {
      const current = localAnswer.arrayValue || [];
      arrayValue = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
    } else {
      arrayValue = [optionId];
    }

    const updated = { ...localAnswer, arrayValue };
    setLocalAnswer(updated);
    if (!previewMode) onAnswer(updated);
  };

  const handleNumericChange = (value: number) => {
    const updated = { ...localAnswer, numericValue: value };
    setLocalAnswer(updated);
    if (!previewMode) onAnswer(updated);
  };

  const renderQuestion = () => {
    switch (question.type) {
      case "MULTIPLE_CHOICE":
      case "SINGLE_CHOICE":
        return (
          <div className="space-y-3">
            {(question.options || []).map((option) => {
              const isSelected = (localAnswer.arrayValue || []).includes(option.id);
              return (
                <motion.button
                  key={option.id}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOptionToggle(option.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200",
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border/50 hover:border-primary/40 hover:bg-accent/30",
                  )}
                >
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      question.type === "SINGLE_CHOICE" ? "rounded-full" : "rounded-md",
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground/40",
                    )}
                  >
                    {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                  <span className="text-sm font-medium">{option.text}</span>
                </motion.button>
              );
            })}
          </div>
        );

      case "TEXT_SHORT":
      case "TEXT_LONG":
      case "ESSAY":
        const rows = question.type === "TEXT_SHORT" ? 3 : question.type === "TEXT_LONG" ? 5 : 8;
        return (
          <Textarea
            value={localAnswer.textValue || ""}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={String(question.placeholder || "Type your response here...")}
            rows={rows}
            className="w-full resize-none text-sm focus-visible:ring-primary"
          />
        );

      case "RATING_SCALE":
        const min = Number(question.minValue ?? 1);
        const max = Number(question.maxValue ?? 5);
        const stars = Array.from({ length: max - min + 1 }, (_, i) => i + min);
        return (
          <div className="flex items-center gap-2 flex-wrap">
            {stars.map((val) => {
              const isSelected = (localAnswer.numericValue || 0) >= val;
              return (
                <motion.button
                  key={val}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNumericChange(val)}
                  className={cn(
                    "transition-colors",
                    isSelected ? "text-amber-400" : "text-muted-foreground/30 hover:text-amber-300",
                  )}
                >
                  <Star className="h-8 w-8 fill-current" />
                </motion.button>
              );
            })}
            {localAnswer.numericValue && (
              <span className="text-sm text-muted-foreground ml-2">
                {localAnswer.numericValue}/{max}
              </span>
            )}
          </div>
        );

      case "SLIDER":
        return (
          <div className="space-y-4">
            <input
              type="range"
              min={Number(question.minValue ?? 0)}
              max={Number(question.maxValue ?? 100)}
              value={localAnswer.numericValue ?? Number(question.minValue ?? 0)}
              onChange={(e) => handleNumericChange(Number(e.target.value))}
              className="w-full accent-violet-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Number(question.minValue ?? 0)}</span>
              <span className="font-semibold text-foreground text-base">
                {localAnswer.numericValue ?? Number(question.minValue ?? 0)}
              </span>
              <span>{Number(question.maxValue ?? 100)}</span>
            </div>
          </div>
        );

      case "CODE_EDITOR":
        return (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border">
              <CodeIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-mono">
                {String(question.codeLanguage || "javascript")}
              </span>
            </div>
            <Textarea
              value={localAnswer.codeValue || String(question.codeSnippet || "")}
              onChange={(e) => {
                const updated = { ...localAnswer, codeValue: e.target.value };
                setLocalAnswer(updated);
                if (!previewMode) onAnswer(updated);
              }}
              placeholder="// Write your code here..."
              rows={10}
              className="font-mono text-sm border-0 rounded-none focus-visible:ring-0"
            />
          </div>
        );

      case "VOICE_RECORDING":
        return (
          <div className="flex flex-col items-center gap-4 py-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsRecording(!isRecording)}
              className={cn(
                "h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                isRecording
                  ? "bg-red-500 shadow-red-500/40 animate-pulse-ring"
                  : "bg-violet-500 hover:bg-violet-600 shadow-violet-500/40",
              )}
            >
              {isRecording ? (
                <MicOff className="h-8 w-8 text-white" />
              ) : (
                <Mic className="h-8 w-8 text-white" />
              )}
            </motion.button>
            <p className="text-sm text-muted-foreground">
              {isRecording ? "Recording... Click to stop" : "Click to start recording"}
            </p>
            {localAnswer.mediaUrl && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="h-4 w-4" />
                Recording saved
              </div>
            )}
          </div>
        );

      case "FILE_UPLOAD":
        return (
          <div className="border-2 border-dashed border-border/50 rounded-2xl p-8 text-center hover:border-primary/40 transition-colors">
            <div className="text-4xl mb-3">📎</div>
            <p className="text-sm font-medium mb-1">Drop files here or click to upload</p>
            <p className="text-xs text-muted-foreground">Max 10MB • All file types supported</p>
            <Button variant="outline" size="sm" className="mt-4">
              Choose file
            </Button>
          </div>
        );

      case "RLHF_TASK":
      case "COMPARATIVE_RANKING":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Rank the following responses from best to worst by clicking to select your preference:
            </p>
            {(question.options || []).map((option, i) => {
              const isSelected = (localAnswer.arrayValue || [])[0] === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    const updated = { ...localAnswer, arrayValue: [option.id] };
                    setLocalAnswer(updated);
                    if (!previewMode) onAnswer(updated);
                  }}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border-2 transition-all",
                    isSelected ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/30",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold",
                      isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground/40 text-muted-foreground",
                    )}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <p className="text-sm">{option.text}</p>
                  </div>
                </button>
              );
            })}
          </div>
        );

      default:
        return (
          <Textarea
            value={localAnswer.textValue || ""}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type your response..."
            rows={4}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Question header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="text-xs">
            {question.type.replace(/_/g, " ")}
          </Badge>
          <div className="flex items-center gap-2">
            {question.isRequired && (
              <span className="text-xs text-red-400">Required</span>
            )}
            {timeLeft !== null && (
              <div className={cn(
                "flex items-center gap-1 text-sm font-mono font-semibold px-2 py-0.5 rounded-lg",
                timeLeft < 10 ? "text-red-400 bg-red-500/10" : "text-muted-foreground bg-muted",
              )}>
                <Clock className="h-3.5 w-3.5" />
                {timeLeft}s
              </div>
            )}
          </div>
        </div>

        <h2 className="text-xl font-semibold leading-relaxed mb-2">{question.title}</h2>

        {question.description && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {question.description}
          </p>
        )}
      </div>

      {/* Timer bar */}
      {question.timeLimit && timeLeft !== null && (
        <Progress
          value={(timeLeft / question.timeLimit) * 100}
          className="h-1"
          indicatorClassName={cn(
            timeLeft < question.timeLimit * 0.2 ? "bg-red-500" : "bg-violet-500",
          )}
        />
      )}

      {/* Question content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderQuestion()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
