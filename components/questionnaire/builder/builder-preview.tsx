"use client";

import { useBuilderStore } from "@/store/questionnaire-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Eye } from "lucide-react";
import { QuestionPlayer } from "@/components/questionnaire/player/question-player";
import { useState } from "react";

interface BuilderPreviewProps {
  onClose: () => void;
}

export function BuilderPreview({ onClose }: BuilderPreviewProps) {
  const { title, questions, difficulty } = useBuilderStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion || questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <Eye className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Nothing to preview</h2>
        <p className="text-muted-foreground mb-4">Add questions first, then preview.</p>
        <Button onClick={onClose}>Close preview</Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Preview header */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-border/50 bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <Badge variant="warning" className="gap-1.5">
            <Eye className="h-3 w-3" />
            Preview Mode
          </Badge>
          <span className="text-sm font-medium">{title}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4 mr-1" />
          Exit preview
        </Button>
      </div>

      {/* Progress */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <QuestionPlayer
            question={currentQuestion}
            onAnswer={() => {}}
            previewMode
          />
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              Previous
            </Button>
            <Button
              variant="gradient"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((i) => i + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
