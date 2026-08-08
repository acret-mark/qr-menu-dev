import { createServiceRoleClient } from "@/lib/supabase/service";
import { claimDueReminders } from "@/lib/subscription/reminders";
import { sendPaymentReminder } from "@/lib/email/send-payment-reminder";

// Placeholder — exact value not yet confirmed with product (spec.md FR-004,
// Assumptions). Overridable via env without a redeploy once confirmed.
const DEFAULT_THRESHOLD_DAYS = 3;

/**
 * First API route in this repo. Invoked on a schedule by Vercel Cron
 * (vercel.json) — never rendered, never reachable as a page. Verifies
 * CRON_SECRET before touching the database or Resend, since an
 * unauthenticated public GET here would otherwise be a way to trigger
 * arbitrary email sends against every pending subscription.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const thresholdDays = Number(process.env.PAYMENT_REMINDER_THRESHOLD_DAYS) || DEFAULT_THRESHOLD_DAYS;
  const supabase = createServiceRoleClient();

  const candidates = await claimDueReminders(supabase, thresholdDays);

  let sent = 0;
  let failed = 0;

  for (const candidate of candidates) {
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("name, owner_id")
      .eq("id", candidate.businessId)
      .maybeSingle();

    if (businessError || !business) {
      console.error("Payment reminder: could not resolve business", candidate.businessId, businessError);
      failed++;
      continue;
    }

    // businesses.contact_email is the wrong field here (nullable, unrelated
    // to login identity — see research.md §1) — the auth-admin API is the
    // only way to read auth.users.email server-side without a matching RLS
    // policy this feature has no reason to add.
    const { data: ownerData, error: ownerError } = await supabase.auth.admin.getUserById(
      business.owner_id
    );

    if (ownerError || !ownerData.user?.email) {
      console.error("Payment reminder: could not resolve owner email", business.owner_id, ownerError);
      failed++;
      continue;
    }

    const result = await sendPaymentReminder({
      toEmail: ownerData.user.email,
      businessName: business.name,
    });

    if (result.ok) {
      sent++;
    } else {
      console.error("Payment reminder send failed", candidate.subscriptionId, result.reason);
      failed++;
    }
  }

  return Response.json({ claimed: candidates.length, sent, failed });
}
