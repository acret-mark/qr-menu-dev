import type { SupabaseClient } from "@supabase/supabase-js";

export type PendingReminderCandidate = {
  subscriptionId: string;
  businessId: string;
};

/**
 * Claims subscriptions due for a payment reminder — a single conditional
 * UPDATE that doubles as both the eligibility filter and the claim, so two
 * overlapping or retried cron runs can never both claim (and thus never
 * both email) the same subscription. See schema-change-request.md and
 * data-model.md.
 *
 * Must be called with a service-role client (src/lib/supabase/service.ts)
 * — there is no owner/admin session for RLS to authorize a cross-tenant
 * scan of every pending subscription against.
 */
export async function claimDueReminders(
  supabase: SupabaseClient,
  thresholdDays: number
): Promise<PendingReminderCandidate[]> {
  const cutoff = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("subscriptions")
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq("status", "pending")
    .is("reminder_sent_at", null)
    .lt("created_at", cutoff)
    .select("id, business_id");

  if (error) {
    console.error("Failed to claim due payment reminders", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    subscriptionId: row.id,
    businessId: row.business_id,
  }));
}
