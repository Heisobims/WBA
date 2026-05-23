"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Bell, Shield, Globe, Trash2, Key, Eye, EyeOff, AlertTriangle, Save,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
type PasswordForm = z.infer<typeof passwordSchema>;

const TABS = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "privacy", label: "Privacy", icon: Globe },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("notifications");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [showScores, setShowScores] = useState(true);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const {
    register,
    handleSubmit,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  async function saveNotifications() {
    setSaving(true);
    try {
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationsEnabled: pushNotifs, emailNotifications: emailNotifs }),
      });
      toast.success("Notification settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(data: PasswordForm) {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed");
      resetPw();
      toast.success("Password changed successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    if (deleteConfirm !== session?.user?.email) {
      toast.error("Email doesn't match");
      return;
    }
    try {
      const res = await fetch("/api/users/me", { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Account deleted");
      router.push("/");
    } catch {
      toast.error("Failed to delete account. Please contact support@wbacademy.com");
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account preferences</p>
      </motion.div>

      <div className="flex gap-1 p-1 bg-stone-100 border border-border rounded-xl">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all",
              activeTab === id
                ? "bg-ink-900 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-stone-200",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl p-6 border border-border bg-white shadow-card space-y-6"
        >
          <h2 className="font-semibold text-foreground">Notification Preferences</h2>

          <div className="space-y-4">
            <Toggle
              label="Email Notifications"
              description="Receive updates about your responses, XP, and questionnaires via email"
              value={emailNotifs}
              onChange={setEmailNotifs}
            />
            <Toggle
              label="Push Notifications"
              description="Get in-app alerts for achievements, mentions, and activity"
              value={pushNotifs}
              onChange={setPushNotifs}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={saveNotifications}
              disabled={saving}
              variant="gradient"
              size="sm"
              loading={saving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl p-6 border border-border bg-white shadow-card space-y-6"
        >
          <h2 className="font-semibold text-foreground">Change Password</h2>
          <form onSubmit={handleSubmit(changePassword)} className="space-y-4">
            {(["currentPassword", "newPassword", "confirmPassword"] as const).map((field) => {
              const labels = {
                currentPassword: "Current Password",
                newPassword: "New Password",
                confirmPassword: "Confirm New Password",
              };
              const showKey = field === "currentPassword" ? "current" : field === "newPassword" ? "new" : "confirm";
              return (
                <div key={field} className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">{labels[field]}</label>
                  <div className="relative">
                    <input
                      {...register(field)}
                      type={showPw[showKey] ? "text" : "password"}
                      className="w-full px-3 py-2 pr-10 bg-white border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-brand-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => ({ ...p, [showKey]: !p[showKey] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPw[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {pwErrors[field] && (
                    <p className="text-xs text-destructive">{pwErrors[field]?.message}</p>
                  )}
                </div>
              );
            })}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                variant="gradient"
                size="sm"
                loading={saving}
                leftIcon={<Key className="h-4 w-4" />}
              >
                {saving ? "Updating…" : "Update Password"}
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Privacy Tab */}
      {activeTab === "privacy" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl p-6 border border-border bg-white shadow-card space-y-6"
        >
          <h2 className="font-semibold text-foreground">Privacy Settings</h2>
          <div className="space-y-4">
            <Toggle
              label="Public Profile"
              description="Allow other users to view your profile and stats"
              value={profilePublic}
              onChange={setProfilePublic}
            />
            <Toggle
              label="Show Quality Scores"
              description="Display your response quality scores on your public profile"
              value={showScores}
              onChange={setShowScores}
            />
          </div>
          <div className="p-4 rounded-xl bg-stone-50 border border-border">
            <p className="text-sm text-muted-foreground">
              Your data is processed in accordance with our{" "}
              <a href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</a>.
              You can request a full data export by contacting{" "}
              <span className="text-brand-600">privacy@wbacademy.com</span>.
            </p>
          </div>
        </motion.div>
      )}

      {/* Danger Zone Tab */}
      {activeTab === "danger" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl p-6 border border-red-200 bg-red-50 space-y-6"
        >
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-semibold">Danger Zone</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                Type your email address <span className="text-foreground font-mono">{session?.user?.email}</span> to confirm
              </p>
              <input
                type="email"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 mb-3 bg-white border border-red-200 rounded-lg text-foreground text-sm focus:outline-none focus:border-red-400"
              />
              <button
                type="button"
                onClick={deleteAccount}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-100 border border-red-300 text-red-600 rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value ? "true" : "false"}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
          value ? "bg-brand-600" : "bg-stone-300",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            value ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}
