import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

// Number formatting
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

// XP and leveling system
export function calculateLevel(xpPoints: number): number {
  return Math.floor(Math.sqrt(xpPoints / 100)) + 1;
}

export function xpForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 100;
}

export function xpForCurrentLevel(currentLevel: number): number {
  return Math.pow(currentLevel - 1, 2) * 100;
}

export function levelProgress(xpPoints: number): {
  level: number;
  currentXP: number;
  neededXP: number;
  percent: number;
} {
  const level = calculateLevel(xpPoints);
  const currentLevelXP = xpForCurrentLevel(level);
  const nextLevelXP = xpForNextLevel(level);
  const currentXP = xpPoints - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const percent = Math.min(100, Math.round((currentXP / neededXP) * 100));
  return { level, currentXP, neededXP, percent };
}

// Slug generation
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Generate unique slug with suffix
export function generateUniqueSlug(title: string): string {
  const base = generateSlug(title);
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

// Color utilities
export const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-red-500/20 text-red-400 border-red-500/30",
  ADMIN: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  REVIEWER: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  AI_TRAINER: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  USER: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  REVIEW: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PUBLISHED: "bg-green-500/20 text-green-400 border-green-500/30",
  ARCHIVED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  PAUSED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
  SUSPENDED: "bg-red-500/20 text-red-400 border-red-500/30",
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
  IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  FLAGGED: "bg-red-500/20 text-red-400 border-red-500/30",
};

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Beginner",
  2: "Easy",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

export const DIFFICULTY_COLORS: Record<number, string> = {
  1: "text-green-400",
  2: "text-emerald-400",
  3: "text-yellow-400",
  4: "text-orange-400",
  5: "text-red-400",
};

// Array utilities
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const groupKey = String(item[key]);
      return {
        ...groups,
        [groupKey]: [...(groups[groupKey] || []), item],
      };
    },
    {} as Record<string, T[]>,
  );
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

// Generate avatar initials
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Random color for user avatars
export function getAvatarColor(seed: string): string {
  const colors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-indigo-600",
    "from-cyan-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
  ];
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

// File size formatting
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

// Quality score color
export function qualityScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

// Debounce
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
