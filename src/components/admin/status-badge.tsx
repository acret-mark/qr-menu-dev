import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { BusinessStatus } from "@/lib/admin/types";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
  {
    variants: {
      status: {
        // Soft (tinted) fills for gray/red/green — same semantic colors,
        // gentler than a full-strength fill + inverted text. `trial`
        // (amber/gold `warning`) intentionally left as a solid fill; only
        // gray/red/green were asked to soften.
        active: "bg-success/15 text-success",
        trial: "bg-warning text-warning-foreground",
        pending: "bg-muted text-muted-foreground",
        suspended: "bg-destructive/15 text-destructive",
      } satisfies Record<BusinessStatus, string>,
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  status: BusinessStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)}>{status}</span>
  );
}
