"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, MapPin, Globe, FileText, Save, Camera, Trophy, Zap, Flame, Target } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { XPProgressBar } from "@/components/gamification/xp-progress-bar";
import { StreakBadge } from "@/components/gamification/streak-badge";
import { LevelBadge } from "@/components/gamification/level-badge";
import { AchievementCard } from "@/components/gamification/achievement-card";

const profileSchema = z.object({
  name: z.string().min(1).max(60),
  bio: z.string().max(300).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal("")),
});
type ProfileForm = z.infer<typeof profileSchema>;

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  plan: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  xpPoints: number;
  level: number;
  streakDays: number;
  totalResponses: number;
  completedQuestionnaires: number;
  avgQualityScore: number | null;
  createdAt: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  earned: boolean;
  earnedAt?: string | null;
}

const STAT_CARDS = [
  { label: "Responses", icon: Target, field: "totalResponses" as const },
  { label: "Questionnaires", icon: FileText, field: "completedQuestionnaires" as const },
  { label: "Avg Quality", icon: Trophy, field: "avgQualityScore" as const, suffix: "%" },
];

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    const safeJson = (r: Response) => r.ok ? r.json() : Promise.resolve({});
    Promise.all([
      fetch("/api/users/me").then(safeJson),
      fetch("/api/achievements").then(safeJson),
    ]).then(([userData, achData]) => {
      if (userData.success) {
        setProfile(userData.data);
        reset({
          name: userData.data.name || "",
          bio: userData.data.bio || "",
          location: userData.data.location || "",
          website: userData.data.website || "",
        });
      }
      if (achData.success) {
        setRecentAchievements(
          achData.data.filter((a: Achievement) => a.earned).slice(0, 6),
        );
      }
    }).finally(() => setLoading(false));
  }, [reset]);

  async function onSubmit(data: ProfileForm) {
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error();
      setProfile((prev) => prev ? { ...prev, ...data } : prev);
      await updateSession();
      setEditing(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-border shadow-card"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-brand-600 ring-4 ring-brand-100">
              {profile.image ? (
                <Image src={profile.image} alt={profile.name} width={96} height={96} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                  {profile.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2">
              <LevelBadge level={profile.level} size="sm" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground text-sm">{profile.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full">
                    {profile.role.replace("_", " ")}
                  </span>
                  <span className="text-xs bg-stone-100 text-muted-foreground px-2 py-0.5 rounded-full capitalize border border-border">
                    {profile.plan.toLowerCase()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StreakBadge days={profile.streakDays} size="sm" />
                <button
                  onClick={() => setEditing(!editing)}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-foreground text-sm transition-colors border border-border"
                >
                  {editing ? "Cancel" : "Edit Profile"}
                </button>
              </div>
            </div>

            {profile.bio && !editing && (
              <p className="text-muted-foreground text-sm leading-relaxed">{profile.bio}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-brand-600 hover:text-brand-700"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>

            <XPProgressBar xpPoints={profile.xpPoints} />
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 pt-6 border-t border-border space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Display Name</label>
                <input
                  {...register("name")}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-brand-400 placeholder:text-muted-foreground/40"
                  placeholder="Your name"
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Location</label>
                <input
                  {...register("location")}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-brand-400 placeholder:text-muted-foreground/40"
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-muted-foreground font-medium">Bio</label>
                <textarea
                  {...register("bio")}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-brand-400 placeholder:text-muted-foreground/40 resize-none"
                  placeholder="Tell us about yourself..."
                />
                {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-muted-foreground font-medium">Website</label>
                <input
                  {...register("website")}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-brand-400 placeholder:text-muted-foreground/40"
                  placeholder="https://yoursite.com"
                />
                {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || !isDirty}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </motion.form>
        )}
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {STAT_CARDS.map(({ label, icon: Icon, field, suffix }, i) => (
          <motion.div
            key={field}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-4 border border-border shadow-card text-center"
          >
            <Icon className="h-5 w-5 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {profile[field] != null ? Math.round(profile[field] as number) : "—"}
              {suffix && profile[field] != null ? suffix : ""}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Recent Achievements
            </h2>
            <a href="/achievements" className="text-sm text-brand-600 hover:text-brand-700">
              View all →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentAchievements.map((a, i) => (
              <AchievementCard key={a.id} achievement={a} index={i} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
