import type {
  User,
  Questionnaire,
  Question,
  Response,
  Answer,
  AIEvaluation,
  Achievement,
  UserAchievement,
  Notification,
  Team,
  TeamMember,
  Dataset,
  Analytics,
  AuditLog,
  LeaderboardEntry,
  QuestionTemplate,
} from "@prisma/client";

// Re-export Prisma types
export type {
  User,
  Questionnaire,
  Question,
  Response,
  Answer,
  AIEvaluation,
  Achievement,
  UserAchievement,
  Notification,
  Team,
  TeamMember,
  Dataset,
  Analytics,
  AuditLog,
  LeaderboardEntry,
  QuestionTemplate,
};

// ============================================
// EXTENDED TYPES
// ============================================

export type UserWithStats = User & {
  _count: {
    responses: number;
    questionnairesCreated: number;
    userAchievements: number;
  };
  userAchievements: (UserAchievement & { achievement: Achievement })[];
};

export type QuestionnaireWithRelations = Questionnaire & {
  questions: Question[];
  author: Pick<User, "id" | "name" | "email" | "image">;
  _count: {
    responses: number;
    questions: number;
  };
};

export type QuestionWithOptions = Question & {
  options: QuestionOption[];
};

export type ResponseWithAnswers = Response & {
  answers: Answer[];
  questionnaire: Pick<Questionnaire, "id" | "title">;
  user: Pick<User, "id" | "name" | "email" | "image"> | null;
  aiEvaluation: AIEvaluation | null;
};

export type TeamWithMembers = Team & {
  members: (TeamMember & {
    user: Pick<User, "id" | "name" | "email" | "image" | "role">;
  })[];
  _count: { members: number };
};

// ============================================
// UI / FORM TYPES
// ============================================

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  imageUrl?: string;
  value?: string | number;
}

export interface BranchingRule {
  id: string;
  condition: {
    type: "equals" | "contains" | "greaterThan" | "lessThan" | "notEquals";
    value: string | number | boolean;
  };
  action: "jump" | "skip" | "end" | "show";
  targetQuestionId?: string;
}

export interface QuestionnaireBuilderState {
  questionnaire: Partial<QuestionnaireWithRelations>;
  questions: QuestionBuilderItem[];
  activeQuestionId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  previewMode: boolean;
}

export interface QuestionBuilderItem {
  id: string;
  tempId?: string;
  type: string;
  title: string;
  description?: string;
  options: QuestionOption[];
  isRequired: boolean;
  timeLimit?: number | null;
  scoringEnabled: boolean;
  maxScore?: number | null;
  aiFollowUp: boolean;
  branchingRules: BranchingRule[];
  tags: string[];
  order: number;
  // Additional fields
  [key: string]: unknown;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
  code?: string;
}

// ============================================
// QUESTIONNAIRE PLAYER
// ============================================

export interface QuestionnaireSession {
  sessionId: string;
  questionnaireId: string;
  userId?: string;
  startedAt: Date;
  currentQuestionIndex: number;
  answers: Record<string, AnswerValue>;
  timeSpent: number;
  isCompleted: boolean;
}

export type AnswerValue = {
  textValue?: string;
  numericValue?: number;
  booleanValue?: boolean;
  arrayValue?: string[];
  jsonValue?: unknown;
  fileUrls?: string[];
  mediaUrl?: string;
  codeValue?: string;
  codeLanguage?: string;
  timeSpentSeconds?: number;
};

// ============================================
// ANALYTICS TYPES
// ============================================

export interface DashboardStats {
  totalResponses: number;
  totalQuestionnaires: number;
  avgQualityScore: number;
  completionRate: number;
  activeUsers: number;
  xpEarnedToday: number;
  trendsResponses: number;
  trendsQuestionnaires: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface DropOffData {
  questionIndex: number;
  questionTitle: string;
  dropOffRate: number;
  completions: number;
}

// ============================================
// GAMIFICATION TYPES
// ============================================

export interface XPEvent {
  type: string;
  xpAmount: number;
  description: string;
  timestamp: Date;
}

export interface AchievementProgress {
  achievement: Achievement;
  isUnlocked: boolean;
  progress: number;
  unlockedAt?: Date;
}

export interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  image?: string;
  xpPoints: number;
  level: number;
  responses: number;
}

// ============================================
// ADMIN TYPES
// ============================================

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalQuestionnaires: number;
  publishedQuestionnaires: number;
  totalResponses: number;
  responsesToday: number;
  avgQualityScore: number;
  pendingModeration: number;
  flaggedResponses: number;
  totalDatasets: number;
  systemHealth: "healthy" | "warning" | "critical";
}

export interface ModerationItem {
  id: string;
  type: "response" | "questionnaire";
  content: string;
  reason: string;
  severity: "low" | "medium" | "high";
  userId: string;
  userName: string;
  createdAt: Date;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface NotificationData {
  achievementId?: string;
  questionnaireId?: string;
  responseId?: string;
  xpAmount?: number;
  levelUp?: number;
  teamId?: string;
}

// ============================================
// THEME TYPES
// ============================================

export type Theme = "light" | "dark" | "system";

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}

// ============================================
// FILTER & SORT TYPES
// ============================================

export interface QuestionnaireFilters {
  status?: string;
  category?: string;
  difficulty?: number;
  authorId?: string;
  teamId?: string;
  search?: string;
  tags?: string[];
}

export interface UserFilters {
  role?: string;
  status?: string;
  plan?: string;
  search?: string;
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}
