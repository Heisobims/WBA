import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-50 text-brand-700 border-brand-200",
        secondary:
          "border-transparent bg-stone-100 text-stone-700 border-stone-200",
        destructive:
          "border-transparent bg-red-50 text-red-700 border-red-200",
        outline:
          "text-foreground border-border bg-white",
        success:
          "border-transparent bg-emerald-50 text-emerald-700 border-emerald-200",
        warning:
          "border-transparent bg-amber-50 text-amber-700 border-amber-200",
        info:
          "border-transparent bg-blue-50 text-blue-700 border-blue-200",
        dark:
          "border-transparent bg-ink-900 text-white",
        gradient:
          "border-brand-200 bg-brand-50 text-brand-700 font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
