"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerStore } from "@/store/questionnaire-store";
import { QuestionPlayer } from "./question-player";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain, ArrowLeft, ArrowRight, CheckCircle, Zap, Trophy,
  Sparkles, Clock, X, Star
} from "lucide-react";
import { cn, formatDuration, levelProgress } from "@/lib/utils";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import type { AnswerValue } from "@/types";

interface Questionnaire {
  id: string;
  title: string;
  description: string | null;
  xpReward: number;
  showProgress: boolean;
  allowResume: boolean;
  adaptiveEnabled: boolean;
  timeLimit: number | null;
}

interface Question {
  id: string;
  type: string;
  title: string;
  description: string | null;
  options: unknown;
  isRequired: boolean;
  timeLimit: number | null;
  minValue: number | null;
  maxValue: number | null;
  codeSnippet: string | null;
  codeLanguage: string | null;
  aiFollowUp: boolean;
  [key: string]: unknown;
}

interface QuestionnairePlayerShellProps {
  questionnaire: Questionnaire;
  questions: Question[];
  userId: string;
}

export function QuestionnairePlayerShell({
  questionnaire,
  questions: initialQuestions,
  userId,
}: QuestionnairePlayerShellProps) {
  const router = useRouter();
  const {
    currentIndex, answers, startTime, initSession, setAnswer,
    nextQuestion, prevQuestion, completeSession, setResponseId,
    getTimeSpent, getQuestionTimeSpent,
  } = usePlayerStore();

  const [allQuestions, setAllQuestions] = useState(initialQuestions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionData, setCompletionData] = useState<{
    xpEarned: number;
    qualityScore: number;
    newLevel?: number;
  } | null>(null);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    initSession(questionnaire.id, initialQuestions.length);
  }, []);

  const currentQuestion = allQuestions[currentIndex];
  const progress = Math.round(((currentIndex) / allQuestions.length) * 100);
  const isLast = currentIndex === allQuestions.length - 1;

  const handleAnswer = useCallback(
    (answer: AnswerValue) => {
      if (!currentQuestion) return;
      setAnswer(currentQuestion.id, {
        ...answer,
        timeSpentSeconds: getQuestionTimeSpent(),
      });
    },
    [currentQuestion, setAnswer, getQuestionTimeSpent],
  );

  const handleNext = async () => {
    if (!currentQuestion) return;

    const currentAnswer = answers[currentQuestion.id];

    if (currentQuestion.isRequired && !hasAnswer(currentAnswer)) {
      toast.error("Please answer this question before continuing.");
      return;
    }

    // Generate AI follow-up if enabled
    if (currentQuestion.aiFollowUp && currentAnswer?.textValue && questionnaire.adaptiveEnabled) {
      try {
        const res = await fetch("/api/ai/follow-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionTitle: currentQuestion.title,
            userResponse: currentAnswer.textValue,
          }),
        });
        if (res.ok) {
          const { followUp } = await res.json();
          if (followUp) {
            const aiQuestion: Question = {
              id: `ai-${Date.now()}`,
              type: "TEXT_LONG",
              title: followUp,
              description: "AI-generated follow-up question",
              options: null,
              isRequired: false,
              timeLimit: null,
              minValue: null,
              maxValue: null,
              codeSnippet: null,
              codeLanguage: null,
              aiFollowUp: false,
            };
            setAllQuestions((prev) => {
              const newQuestions = [...prev];
              newQuestions.splice(currentIndex + 1, 0, aiQuestion);
              return newQuestions;
            });
          }
        }
      } catch {}
    }

    if (isLast) {
      await handleSubmit();
    } else {
      setDirection(1);
      nextQuestion();
    }
  };

  const handlePrev = () => {
    setDirection(-1);
    prevQuestion();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const answersArray = allQuestions.map((q) => ({
        questionId: q.id,
        ...answers[q.id],
      })).filter((a) => a.questionId && Object.keys(a).length > 1);

      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionnaireId: questionnaire.id,
          answers: answersArray,
          timeSpentSeconds: getTimeSpent(),
        }),
      });

      if (!response.ok) throw new Error("Submission failed");

      const { data } = await response.json();
      setResponseId(data.responseId);
      completeSession();

      setCompletionData({
        xpEarned: data.xpEarned || questionnaire.xpReward,
        qualityScore: data.qualityScore || 0,
        newLevel: data.newLevel,
      });
      setIsCompleted(true);

      // Celebrate!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8b5cf6", "#6366f1", "#f59e0b"],
      });
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted && completionData) {
    return <CompletionScreen questionnaire={questionnaire} data={completionData} />;
  }

  if (!currentQuestion) return null;

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 h-14 px-6 border-b border-border/50 bg-card/50 backdrop-blur-sm shrink-0">
        <button
          onClick={() => router.push("/questionnaires")}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex-1">
          <p className="text-sm font-medium truncate">{questionnaire.title}</p>
        </div>

        {questionnaire.showProgress && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1}/{allQuestions.length}
            </span>
            <div className="w-24">
              <Progress value={progress} gradient className="h-1.5" />
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-violet-400">
            +{questionnaire.xpReward} XP
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {questionnaire.showProgress && (
        <div className="h-0.5 bg-muted">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Question area */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center p-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion.id}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  x: dir > 0 ? 40 : -40,
                  opacity: 0,
                }),
                center: { x: 0, opacity: 1 },
                exit: (dir: number) => ({
                  x: dir > 0 ? -40 : 40,
                  opacity: 0,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <QuestionPlayer
                question={currentQuestion as any}
                onAnswer={handleAnswer}
                currentAnswer={answers[currentQuestion.id]}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="shrink-0 border-t border-border/50 bg-card/50 backdrop-blur-sm px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {allQuestions.slice(0, 10).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i < currentIndex
                    ? "bg-primary w-3"
                    : i === currentIndex
                    ? "bg-primary w-5"
                    : "bg-muted w-1.5",
                )}
              />
            ))}
          </div>

          <Button
            variant="gradient"
            onClick={handleNext}
            loading={isSubmitting}
          >
            {isLast ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Submit
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function hasAnswer(answer: AnswerValue | undefined): boolean {
  if (!answer) return false;
  return !!(
    answer.textValue?.trim() ||
    (answer.arrayValue?.length ?? 0) > 0 ||
    answer.numericValue !== undefined ||
    answer.booleanValue !== undefined ||
    (answer.fileUrls?.length ?? 0) > 0 ||
    answer.codeValue?.trim() ||
    answer.mediaUrl
  );
}

function CompletionScreen({
  questionnaire,
  data,
}: {
  questionnaire: Questionnaire;
  data: { xpEarned: number; qualityScore: number; newLevel?: number };
}) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md text-center"
      >
        <div className="relative mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", damping: 10 }}
            className="h-24 w-24 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto shadow-2xl shadow-violet-500/40"
          >
            <Trophy className="h-12 w-12 text-white" />
          </motion.div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Questionnaire Complete!</h1>
        <p className="text-muted-foreground mb-8">
          Great work! Your responses will help train better AI systems.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card variant="gradient">
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 text-violet-400 mx-auto mb-2" />
              <div className="text-2xl font-bold gradient-text">+{data.xpEarned}</div>
              <div className="text-xs text-muted-foreground">XP Earned</div>
            </CardContent>
          </Card>
          <Card variant="default">
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {Math.round(data.qualityScore)}%
              </div>
              <div className="text-xs text-muted-foreground">Quality Score</div>
            </CardContent>
          </Card>
        </div>

        {data.newLevel && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30"
          >
            <Sparkles className="h-5 w-5 text-amber-400 mx-auto mb-1" />
            <p className="font-semibold text-amber-400">Level Up!</p>
            <p className="text-sm text-muted-foreground">
              You&apos;ve reached Level {data.newLevel}!
            </p>
          </motion.div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.push("/dashboard")}>
            Back to dashboard
          </Button>
          <Button
            variant="gradient"
            className="flex-1"
            onClick={() => router.push("/questionnaires")}
          >
            More questionnaires
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
