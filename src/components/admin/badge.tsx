import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        // Soft (tinted) fills, not solid — same semantic colors (green/
        // gray/red), just gentler than a full-strength fill + inverted
        // text. `warning` (amber/gold) intentionally left as a solid fill;
        // only gray/red/green were asked to soften.
        success: "bg-success/15 text-success",
        warning: "bg-warning text-warning-foreground",
        neutral: "bg-muted text-muted-foreground",
        destructive: "bg-destructive/15 text-destructive",
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
