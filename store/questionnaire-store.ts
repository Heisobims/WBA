"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { QuestionBuilderItem, AnswerValue } from "@/types";

// ============================================
// BUILDER STORE
// ============================================

interface BuilderState {
  questionnaireId: string | null;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: string;
  isPublic: boolean;
  requireAuth: boolean;
  randomizeOrder: boolean;
  showProgress: boolean;
  allowResume: boolean;
  timeLimit: number | null;
  estimatedTime: number | null;
  maxResponses: number | null;
  maxAttempts: number;
  aiEnabled: boolean;
  adaptiveEnabled: boolean;
  xpReward: number;
  difficulty: number;
  coverImage: string | null;
  primaryColor: string | null;

  questions: QuestionBuilderItem[];
  activeQuestionId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  previewMode: boolean;

  setField: <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => void;
  addQuestion: (type: string) => void;
  removeQuestion: (id: string) => void;
  updateQuestion: (id: string, updates: Partial<QuestionBuilderItem>) => void;
  reorderQuestions: (fromIndex: number, toIndex: number) => void;
  setActiveQuestion: (id: string | null) => void;
  duplicateQuestion: (id: string) => void;
  setIsDirty: (dirty: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setLastSaved: (date: Date) => void;
  togglePreviewMode: () => void;
  loadQuestionnaire: (data: Partial<BuilderState>) => void;
  reset: () => void;
}

const defaultQuestion = (type: string, order: number): QuestionBuilderItem => ({
  id: uuidv4(),
  type,
  title: "",
  description: "",
  options: type === "MULTIPLE_CHOICE" || type === "SINGLE_CHOICE"
    ? [
        { id: uuidv4(), text: "Option 1", isCorrect: false },
        { id: uuidv4(), text: "Option 2", isCorrect: false },
        { id: uuidv4(), text: "Option 3", isCorrect: false },
        { id: uuidv4(), text: "Option 4", isCorrect: false },
      ]
    : [],
  isRequired: true,
  timeLimit: null,
  scoringEnabled: false,
  maxScore: null,
  aiFollowUp: false,
  branchingRules: [],
  tags: [],
  order,
  minValue: type === "RATING_SCALE" ? 1 : type === "SLIDER" ? 0 : undefined,
  maxValue: type === "RATING_SCALE" ? 5 : type === "SLIDER" ? 100 : undefined,
  codeLanguage: type === "CODE_EDITOR" ? "javascript" : undefined,
});

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      questionnaireId: null,
      title: "Untitled Questionnaire",
      description: "",
      category: "",
      tags: [],
      status: "DRAFT",
      isPublic: false,
      requireAuth: true,
      randomizeOrder: false,
      showProgress: true,
      allowResume: true,
      timeLimit: null,
      estimatedTime: null,
      maxResponses: null,
      maxAttempts: 1,
      aiEnabled: false,
      adaptiveEnabled: false,
      xpReward: 10,
      difficulty: 1,
      coverImage: null,
      primaryColor: null,
      questions: [],
      activeQuestionId: null,
      isDirty: false,
      isSaving: false,
      lastSaved: null,
      previewMode: false,

      setField: (key, value) => set({ [key]: value, isDirty: true } as Partial<BuilderState>),

      addQuestion: (type) => {
        const questions = get().questions;
        const newQuestion = defaultQuestion(type, questions.length);
        set({
          questions: [...questions, newQuestion],
          activeQuestionId: newQuestion.id,
          isDirty: true,
        });
      },

      removeQuestion: (id) => {
        const questions = get().questions.filter((q) => q.id !== id);
        const reordered = questions.map((q, i) => ({ ...q, order: i }));
        set({
          questions: reordered,
          activeQuestionId: get().activeQuestionId === id ? null : get().activeQuestionId,
          isDirty: true,
        });
      },

      updateQuestion: (id, updates) => {
        set({
          questions: get().questions.map((q) =>
            q.id === id ? { ...q, ...updates } : q,
          ),
          isDirty: true,
        });
      },

      reorderQuestions: (fromIndex, toIndex) => {
        const questions = [...get().questions];
        const [removed] = questions.splice(fromIndex, 1);
        questions.splice(toIndex, 0, removed);
        const reordered = questions.map((q, i) => ({ ...q, order: i }));
        set({ questions: reordered, isDirty: true });
      },

      setActiveQuestion: (id) => set({ activeQuestionId: id }),

      duplicateQuestion: (id) => {
        const questions = get().questions;
        const source = questions.find((q) => q.id === id);
        if (!source) return;
        const index = questions.findIndex((q) => q.id === id);
        const duplicate = { ...source, id: uuidv4(), title: `${source.title} (Copy)` };
        const newQuestions = [
          ...questions.slice(0, index + 1),
          duplicate,
          ...questions.slice(index + 1),
        ].map((q, i) => ({ ...q, order: i }));
        set({ questions: newQuestions, activeQuestionId: duplicate.id, isDirty: true });
      },

      setIsDirty: (dirty) => set({ isDirty: dirty }),
      setIsSaving: (saving) => set({ isSaving: saving }),
      setLastSaved: (date) => set({ lastSaved: date }),
      togglePreviewMode: () => set({ previewMode: !get().previewMode }),

      loadQuestionnaire: (data) => set({ ...data, isDirty: false }),

      reset: () =>
        set({
          questionnaireId: null,
          title: "Untitled Questionnaire",
          description: "",
          category: "",
          tags: [],
          status: "DRAFT",
          isPublic: false,
          requireAuth: true,
          randomizeOrder: false,
          showProgress: true,
          allowResume: true,
          timeLimit: null,
          estimatedTime: null,
          maxResponses: null,
          maxAttempts: 1,
          aiEnabled: false,
          adaptiveEnabled: false,
          xpReward: 10,
          difficulty: 1,
          questions: [],
          activeQuestionId: null,
          isDirty: false,
          isSaving: false,
          previewMode: false,
        }),
    }),
    {
      name: "neuroform-builder",
      partialize: (state) => ({
        questionnaireId: state.questionnaireId,
        title: state.title,
        description: state.description,
        questions: state.questions,
        isDirty: state.isDirty,
      }),
    },
  ),
);

// ============================================
// PLAYER STORE
// ============================================

interface PlayerState {
  sessionId: string | null;
  questionnaireId: string | null;
  currentIndex: number;
  totalQuestions: number;
  answers: Record<string, AnswerValue>;
  startTime: number | null;
  questionStartTime: number | null;
  isCompleted: boolean;
  isPaused: boolean;
  responseId: string | null;

  initSession: (questionnaireId: string, totalQuestions: number) => void;
  setAnswer: (questionId: string, answer: AnswerValue) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  jumpToQuestion: (index: number) => void;
  completeSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  setResponseId: (id: string) => void;
  getTimeSpent: () => number;
  getQuestionTimeSpent: () => number;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      questionnaireId: null,
      currentIndex: 0,
      totalQuestions: 0,
      answers: {},
      startTime: null,
      questionStartTime: null,
      isCompleted: false,
      isPaused: false,
      responseId: null,

      initSession: (questionnaireId, totalQuestions) => {
        const existing = get();
        if (existing.questionnaireId === questionnaireId && !existing.isCompleted) {
          set({ questionStartTime: Date.now() });
          return;
        }
        set({
          sessionId: uuidv4(),
          questionnaireId,
          currentIndex: 0,
          totalQuestions,
          answers: {},
          startTime: Date.now(),
          questionStartTime: Date.now(),
          isCompleted: false,
          isPaused: false,
          responseId: null,
        });
      },

      setAnswer: (questionId, answer) => {
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer },
        }));
      },

      nextQuestion: () => {
        const { currentIndex, totalQuestions } = get();
        if (currentIndex < totalQuestions - 1) {
          set({ currentIndex: currentIndex + 1, questionStartTime: Date.now() });
        }
      },

      prevQuestion: () => {
        const { currentIndex } = get();
        if (currentIndex > 0) {
          set({ currentIndex: currentIndex - 1, questionStartTime: Date.now() });
        }
      },

      jumpToQuestion: (index) => {
        set({ currentIndex: index, questionStartTime: Date.now() });
      },

      completeSession: () => set({ isCompleted: true }),
      pauseSession: () => set({ isPaused: true }),
      resumeSession: () => set({ isPaused: false, questionStartTime: Date.now() }),
      setResponseId: (id) => set({ responseId: id }),

      getTimeSpent: () => {
        const { startTime } = get();
        if (!startTime) return 0;
        return Math.floor((Date.now() - startTime) / 1000);
      },

      getQuestionTimeSpent: () => {
        const { questionStartTime } = get();
        if (!questionStartTime) return 0;
        return Math.floor((Date.now() - questionStartTime) / 1000);
      },

      reset: () =>
        set({
          sessionId: null,
          questionnaireId: null,
          currentIndex: 0,
          totalQuestions: 0,
          answers: {},
          startTime: null,
          questionStartTime: null,
          isCompleted: false,
          isPaused: false,
          responseId: null,
        }),
    }),
    {
      name: "neuroform-player",
      partialize: (state) => ({
        sessionId: state.sessionId,
        questionnaireId: state.questionnaireId,
        currentIndex: state.currentIndex,
        answers: state.answers,
        startTime: state.startTime,
        responseId: state.responseId,
      }),
    },
  ),
);
