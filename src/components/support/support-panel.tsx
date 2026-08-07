import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSupportTicketsForOwner } from "@/lib/support/queries";
import { SupportTicketForm } from "@/components/support/support-ticket-form";
import { TicketStatusBadge } from "@/components/support/ticket-status-badge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function SupportPanel() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Every owner route already guarantees a signed-in user with a valid
  // business row before any panel content renders.
  const tickets = await getSupportTicketsForOwner(supabase, user!.id);

  return (
    <div className="flex flex-col gap-4">
      <SupportTicketForm />

      <div className="px-4 text-sm font-semibold text-foreground">Your Tickets</div>

      {tickets.length === 0 ? (
        <p className="px-4 pb-4 text-sm text-muted-foreground">
          You haven&rsquo;t submitted any support tickets yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2 px-4 pb-4">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                href={`/support/${ticket.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3.5 py-3"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">{ticket.subject}</span>
                  <span className="text-xs text-muted-foreground">
                    Submitted {formatDate(ticket.createdAt)}
                  </span>
                </div>
                <TicketStatusBadge status={ticket.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
