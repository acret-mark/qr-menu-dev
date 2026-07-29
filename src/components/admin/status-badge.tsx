import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { BusinessStatus } from "@/lib/admin/types";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
  {
    variants: {
      status: {
        active: "bg-success text-success-foreground",
        trial: "bg-warning text-warning-foreground",
        pending: "bg-border text-foreground",
        suspended: "bg-destructive text-destructive-foreground",
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
