import { z } from "zod";
import { QuestionType, QuestionnaireStatus, UserRole } from "@prisma/client";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// User schemas
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal("")),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Question option schema
export const questionOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
});

// Question schema
export const questionSchema = z.object({
  type: z.nativeEnum(QuestionType),
  title: z.string().min(3, "Question must be at least 3 characters").max(2000),
  description: z.string().max(1000).optional(),
  placeholder: z.string().max(200).optional(),
  helperText: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
  codeSnippet: z.string().optional(),
  codeLanguage: z.string().optional(),
  isRequired: z.boolean().default(true),
  allowMultiple: z.boolean().default(false),
  timeLimit: z.number().min(10).max(3600).optional().nullable(),
  minLength: z.number().min(0).optional().nullable(),
  maxLength: z.number().min(1).optional().nullable(),
  minValue: z.number().optional().nullable(),
  maxValue: z.number().optional().nullable(),
  options: z.array(questionOptionSchema).optional(),
  scoringEnabled: z.boolean().default(false),
  maxScore: z.number().min(0).optional().nullable(),
  aiFollowUp: z.boolean().default(false),
  branchingRules: z.array(z.any()).optional(),
  tags: z.array(z.string()).default([]),
});

// Questionnaire schema
export const createQuestionnaireSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().max(2000).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.nativeEnum(QuestionnaireStatus).default("DRAFT"),
  isPublic: z.boolean().default(false),
  requireAuth: z.boolean().default(true),
  allowAnonymous: z.boolean().default(false),
  randomizeOrder: z.boolean().default(false),
  showProgress: z.boolean().default(true),
  allowResume: z.boolean().default(true),
  timeLimit: z.number().min(60).max(86400).optional().nullable(),
  estimatedTime: z.number().min(1).max(480).optional().nullable(),
  maxResponses: z.number().min(1).optional().nullable(),
  maxAttempts: z.number().min(1).default(1),
  aiEnabled: z.boolean().default(false),
  adaptiveEnabled: z.boolean().default(false),
  xpReward: z.number().min(0).max(1000).default(10),
  difficulty: z.number().min(1).max(5).default(1),
  coverImage: z.string().url().optional(),
  primaryColor: z.string().optional(),
  questions: z.array(questionSchema).default([]),
});

export const updateQuestionnaireSchema = createQuestionnaireSchema.partial();

// Response/Answer schema
export const submitAnswerSchema = z.object({
  questionId: z.string(),
  textValue: z.string().optional(),
  numericValue: z.number().optional(),
  booleanValue: z.boolean().optional(),
  arrayValue: z.array(z.string()).optional(),
  jsonValue: z.any().optional(),
  fileUrls: z.array(z.string().url()).optional(),
  mediaUrl: z.string().url().optional(),
  codeValue: z.string().optional(),
  codeLanguage: z.string().optional(),
  timeSpentSeconds: z.number().optional(),
});

export const submitResponseSchema = z.object({
  questionnaireId: z.string(),
  answers: z.array(submitAnswerSchema),
  timeSpentSeconds: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

// Admin schemas
export const adminUpdateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  plan: z.enum(["FREE", "STARTER", "PRO", "ENTERPRISE"]).optional(),
});

// AI question generation schema
export const generateQuestionsSchema = z.object({
  topic: z.string().min(3, "Topic is required"),
  category: z.string().min(2, "Category is required"),
  count: z.number().min(1).max(20).default(5),
  difficulty: z.number().min(1).max(5).default(3),
  types: z.array(z.nativeEnum(QuestionType)).optional(),
  context: z.string().max(1000).optional(),
});

// Team schemas
export const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(50),
  description: z.string().max(500).optional(),
});

// Contact schema
export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(5, "Subject is required"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateQuestionnaireInput = z.infer<typeof createQuestionnaireSchema>;
export type UpdateQuestionnaireInput = z.infer<typeof updateQuestionnaireSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;
