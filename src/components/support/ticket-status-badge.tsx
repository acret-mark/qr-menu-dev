import type { TicketStatus } from "@/lib/support/types";

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const STATUS_VARIANT_CLASSES: Record<TicketStatus, string> = {
  open: "bg-warning text-warning-foreground",
  in_progress: "bg-warning text-warning-foreground",
  // Soft (tinted) fill, matching badge.tsx/status-badge.tsx's own softened
  // success tone — `warning` above left as a solid fill (only gray/red/
  // green were asked to soften).
  resolved: "bg-success/15 text-success",
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_VARIANT_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
