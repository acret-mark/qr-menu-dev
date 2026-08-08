import Link from "next/link";
import { TicketStatusBadge } from "@/components/support/ticket-status-badge";
import type { SupportTicketDetail } from "@/lib/support/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TicketResolvedView({ ticket }: { ticket: SupportTicketDetail }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard" aria-label="Back to support" className="text-muted-foreground">
          ←
        </Link>
        <h1 className="font-heading text-xl font-semibold">Ticket</h1>
      </div>

      <div className="flex items-start justify-between gap-3">
        <h2 className="flex-1 text-lg font-semibold">{ticket.subject}</h2>
        <TicketStatusBadge status={ticket.status} />
      </div>
      <div className="mt-1 text-sm text-muted-foreground">
        Submitted {formatDate(ticket.createdAt)}
      </div>

      <div className="mt-5 border-t border-border pt-5">
        <div className="text-sm font-medium text-muted-foreground">Your message</div>
        <p className="mt-1.5 text-base">{ticket.message}</p>

        <div className="mt-5 border-t border-dashed border-border pt-5">
          <div className="text-sm font-medium text-muted-foreground">
            ACRET Support
            {ticket.repliedAt && ` · ${formatDate(ticket.repliedAt)}`}
          </div>
          <p className="mt-1.5 text-base">
            {ticket.adminReply ?? "No reply was recorded."}
          </p>
        </div>
      </div>
    </div>
  );
}
