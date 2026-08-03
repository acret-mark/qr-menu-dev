"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { replyToSupportTicket, setTicketStatus } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { formatAdminDate } from "@/lib/admin/format";
import type { AdminSupportTicket, TicketStatus } from "@/lib/admin/types";

const FIELD_CLASSNAME =
  "h-9 rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

const TEXTAREA_CLASSNAME =
  "min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

export function TicketReplyPanel({ ticket }: { ticket: AdminSupportTicket }) {
  const router = useRouter();
  const [reply, setReply] = useState(ticket.adminReply ?? "");
  // Only the admin's explicit override lives in state — never a mirrored
  // copy of `ticket.status`. A mirrored copy would either go stale after a
  // reply changes the server's status underneath it, or (if resynced via an
  // effect) require resetting on every prop change, which would erase the
  // override itself right when a subsequent reply needs it most (User Story
  // 3, Acceptance Scenario 3). Deriving the displayed value from props +
  // override below avoids both problems with no effect at all.
  const [statusOverride, setStatusOverride] = useState<TicketStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = statusOverride ?? ticket.status;
  const trimmedReply = reply.trim();

  async function handleStatusChange(nextStatus: TicketStatus) {
    setStatusOverride(nextStatus);
    setIsChangingStatus(true);
    setError(null);
    try {
      // Status-only update, independent of any reply — never touches
      // admin_reply/replied_at (FR-010, FR-011). No separate "save" step,
      // matching the reference's live select.
      const result = await setTicketStatus({ ticketId: ticket.id, status: nextStatus });

      if (!result.ok) {
        setError(result.reason);
        return;
      }

      router.refresh();
    } finally {
      setIsChangingStatus(false);
    }
  }

  async function handleSendReply() {
    setIsSubmitting(true);
    setError(null);
    try {
      // Only passes an explicit status when the admin actually changed the
      // control themselves — otherwise omit it so the server's "resolved"
      // default (FR-009) applies. Passing `status` unconditionally here
      // would silently re-send the ticket's pre-existing status on every
      // reply and permanently disable the default.
      const result = await replyToSupportTicket({
        ticketId: ticket.id,
        reply: trimmedReply,
        ...(statusOverride ? { status: statusOverride } : {}),
      });

      if (!result.ok) {
        setError(result.reason);
        return;
      }

      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="border-t border-border px-5 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <label htmlFor="ticket-status" className="text-sm font-medium">
          Status
        </label>
        <select
          id="ticket-status"
          value={status}
          disabled={isChangingStatus}
          onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
          className={FIELD_CLASSNAME}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {ticket.adminReply && ticket.repliedAt && (
        <p className="mb-2 text-xs text-muted-foreground">
          Last replied {formatAdminDate(ticket.repliedAt)}
        </p>
      )}

      <label htmlFor="reply-message" className="mb-1.5 block text-sm font-medium">
        Reply to this ticket
      </label>
      <textarea
        id="reply-message"
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Reply to this ticket…"
        className={TEXTAREA_CLASSNAME}
      />

      {error && (
        <div className="mt-2.5 rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        type="button"
        disabled={isSubmitting || trimmedReply.length === 0}
        onClick={handleSendReply}
        className="mt-3"
      >
        {isSubmitting ? "Sending…" : "Send Reply"}
      </Button>
    </div>
  );
}
