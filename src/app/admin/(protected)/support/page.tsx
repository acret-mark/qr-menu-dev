import { getSupportTickets } from "@/lib/admin/queries";
import { SupportInbox } from "@/components/admin/support-inbox";

export default async function SupportTicketsPage() {
  const tickets = await getSupportTickets();
  const openCount = tickets.filter((ticket) => ticket.status !== "resolved").length;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Support Tickets</h1>
        <p className="text-sm text-muted-foreground">
          {tickets.length === 0
            ? "No support tickets yet."
            : `${tickets.length} ${tickets.length === 1 ? "ticket" : "tickets"} · ${openCount} open`}
        </p>
      </div>

      {tickets.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            No support tickets have been submitted yet.
          </p>
        </div>
      ) : (
        <SupportInbox tickets={tickets} />
      )}
    </div>
  );
}
