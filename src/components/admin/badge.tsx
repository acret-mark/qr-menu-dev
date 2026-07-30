import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        success: "bg-success text-success-foreground",
        warning: "bg-warning text-warning-foreground",
        neutral: "bg-border text-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
    },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  tone: "success" | "warning" | "neutral" | "destructive";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ tone, children, className }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>;
}
