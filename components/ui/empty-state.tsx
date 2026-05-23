import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "gradient" | "outline";
  };
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = "default",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "sm" && "py-8 px-4",
        size === "default" && "py-16 px-8",
        size === "lg" && "py-24 px-12",
        className,
      )}
    >
      {Icon && (
        <div
          className={cn(
            "rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mb-4",
            size === "sm" && "h-12 w-12",
            size === "default" && "h-16 w-16",
            size === "lg" && "h-20 w-20",
          )}
        >
          <Icon
            className={cn(
              "text-muted-foreground",
              size === "sm" && "h-5 w-5",
              size === "default" && "h-7 w-7",
              size === "lg" && "h-9 w-9",
            )}
          />
        </div>
      )}
      <h3
        className={cn(
          "font-semibold text-foreground mb-2",
          size === "sm" && "text-sm",
          size === "default" && "text-base",
          size === "lg" && "text-xl",
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "text-muted-foreground max-w-sm leading-relaxed",
            size === "sm" && "text-xs",
            size === "default" && "text-sm",
            size === "lg" && "text-base",
          )}
        >
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "gradient"}
          className="mt-6"
          size={size === "sm" ? "sm" : "default"}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
