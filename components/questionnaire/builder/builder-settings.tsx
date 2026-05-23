"use client";

import { useBuilderStore } from "@/store/questionnaire-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch-ui";

export function BuilderSettings() {
  const {
    description, category, tags, status, isPublic, requireAuth,
    randomizeOrder, showProgress, allowResume, timeLimit,
    estimatedTime, maxAttempts, aiEnabled, adaptiveEnabled,
    xpReward, difficulty, setField,
  } = useBuilderStore();

  return (
    <div className="p-4 space-y-5">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Describe this questionnaire..."
          rows={3}
          className="text-xs"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
        <Input
          value={category}
          onChange={(e) => setField("category", e.target.value)}
          placeholder="e.g., NLP, Computer Vision"
          className="text-xs h-8"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
        <select
          value={status}
          onChange={(e) => setField("status", e.target.value)}
          className="w-full h-8 text-xs rounded-lg border border-input bg-background px-2"
        >
          <option value="DRAFT">Draft</option>
          <option value="REVIEW">Under Review</option>
          <option value="PUBLISHED">Published</option>
          <option value="PAUSED">Paused</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Difficulty (1-5)</label>
        <Input
          type="number"
          value={difficulty}
          onChange={(e) => setField("difficulty", Number(e.target.value))}
          min={1}
          max={5}
          className="text-xs h-8"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">XP Reward</label>
        <Input
          type="number"
          value={xpReward}
          onChange={(e) => setField("xpReward", Number(e.target.value))}
          min={0}
          className="text-xs h-8"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Time Limit (seconds)</label>
        <Input
          type="number"
          value={timeLimit ?? ""}
          onChange={(e) => setField("timeLimit", e.target.value ? Number(e.target.value) : null)}
          placeholder="No limit"
          className="text-xs h-8"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Est. Time (minutes)</label>
        <Input
          type="number"
          value={estimatedTime ?? ""}
          onChange={(e) => setField("estimatedTime", e.target.value ? Number(e.target.value) : null)}
          placeholder="e.g., 15"
          className="text-xs h-8"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Max Attempts</label>
        <Input
          type="number"
          value={maxAttempts}
          onChange={(e) => setField("maxAttempts", Number(e.target.value))}
          min={1}
          className="text-xs h-8"
        />
      </div>

      <div className="space-y-3 pt-2 border-t border-border/50">
        {[
          { field: "isPublic", label: "Public", desc: "Visible to all users" },
          { field: "requireAuth", label: "Require login", desc: "Users must be signed in" },
          { field: "randomizeOrder", label: "Randomize order", desc: "Shuffle question order" },
          { field: "showProgress", label: "Show progress", desc: "Display progress bar" },
          { field: "allowResume", label: "Allow resume", desc: "Save progress to resume later" },
          { field: "aiEnabled", label: "AI scoring", desc: "Score with GPT-4o" },
          { field: "adaptiveEnabled", label: "Adaptive mode", desc: "AI-generated follow-ups" },
        ].map((item) => (
          <div key={item.field} className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
            <Switch
              checked={useBuilderStore.getState()[item.field as keyof typeof useBuilderStore.getState] as boolean}
              onCheckedChange={(v) => setField(item.field as any, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
