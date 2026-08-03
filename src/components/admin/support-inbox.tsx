"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/admin/badge";
import { TicketReplyPanel } from "@/components/admin/ticket-reply-panel";
import { formatAdminDate } from "@/lib/admin/format";
import type { AdminSupportTicket, TicketStatus } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const TICKET_STATUS_TONE: Record<TicketStatus, "success" | "warning" | "neutral"> = {
  open: "warning",
  in_progress: "neutral",
  resolved: "success",
};

const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const STATUS_FILTER_OPTIONS: { value: TicketStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

const FIELD_CLASSNAME =
  "h-9 rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export function SupportInbox({ tickets }: { tickets: AdminSupportTicket[] }) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id ?? null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // getSupportTickets() already returns newest-first; "oldest" is a client-side
  // reversal, not a second query (research.md §4).
  const visibleTickets = useMemo(() => {
    const filtered =
      statusFilter === "all" ? tickets : tickets.filter((ticket) => ticket.status === statusFilter);
    return sortOrder === "newest" ? filtered : [...filtered].reverse();
  }, [tickets, statusFilter, sortOrder]);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;

  return (
    <div className="grid grid-cols-[340px_1fr] overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col border-r border-border">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TicketStatus | "all")}
            className={cn(FIELD_CLASSNAME, "flex-1")}
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Sort order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            className={FIELD_CLASSNAME}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {visibleTickets.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No tickets match this filter.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border overflow-y-auto">
            {visibleTickets.map((ticket) => (
              <li key={ticket.id}>
                <button
                  type="button"
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={cn(
                    "flex w-full flex-col gap-1.5 px-4 py-3 text-left hover:bg-muted",
                    ticket.id === selectedTicketId && "bg-muted"
                  )}
                >
                  <span className="text-sm font-medium">{ticket.subject}</span>
                  <span className="text-xs text-muted-foreground">{ticket.businessName}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatAdminDate(ticket.createdAt)}
                    </span>
                    <Badge tone={TICKET_STATUS_TONE[ticket.status]}>
                      {TICKET_STATUS_LABEL[ticket.status]}
                    </Badge>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col">
        {selectedTicket ? (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-semibold">{selectedTicket.subject}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedTicket.businessName}
                  {selectedTicket.businessEmail ? ` · ${selectedTicket.businessEmail}` : ""}
                </p>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
            </div>
            <TicketReplyPanel key={selectedTicket.id} ticket={selectedTicket} />
          </>
        ) : (
          <p className="p-5 text-sm text-muted-foreground">Select a ticket to read it.</p>
        )}
      </div>
    </div>
  );
}
