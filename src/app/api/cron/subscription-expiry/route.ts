import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { isWithinGrace, newlyCrossedThreshold } from "@/lib/subscription/expiry";
import { sendSubscriptionReminder } from "@/lib/email/send-subscription-reminder";

/**
 * Daily cron per contracts/subscription-expiry-cron.md
 * (specs/032-unified-subscription-lifecycle) — mirrors
 * src/app/api/cron/payment-reminders/route.ts's shape: CRON_SECRET-gated,
 * service-role client, never rendered, never reachable as a page.
 *
 * Deliberately separate from payment-reminders (research.md §1) — that
 * route governs the unrelated pending-payment nudge with its own
 * `reminder_sent_at` column; this one governs the unified trial+paid expiry
 * lifecycle via `subscriptions.expires_at` /
 * `subscriptions.expiry_reminder_sent_at`, added by T001
 * (20260902010000_add_subscriptions_expiry_reminder_sent_at.sql).
 *
 * Deviation from the contract as originally written: contracts/
 * subscription-expiry-cron.md step 2 describes updating "the linked
 * business's derived status to the lockout value" alongside the
 * subscription transition. T001's actual landed schema decision (see
 * tasks.md T001, item 5) is that `businesses.status` gets NO new value for
 * lockout — it stays whatever it already is (`active`/`trial`) for the
 * entire locked state, and lockout is a live computation
 * (src/lib/subscription/access-gate.ts) rather than a stored value. This
 * route therefore only transitions `subscriptions.status` to `expired` and
 * never writes `businesses.status`.
 */
type DueSubscription = {
  id: string;
  business_id: string;
  plan: string;
  status: string;
  expires_at: string;
  expiry_reminder_sent_at: string | null;
};

async function claimReminderSlot(
  supabase: SupabaseClient,
  subscription: DueSubscription,
  now: Date
): Promise<boolean> {
  // Optimistic-concurrency claim: the update only takes effect if
  // expiry_reminder_sent_at still matches the value we read it as, so two
  // overlapping cron runs can't both claim (and thus both email) the same
  // threshold for the same subscription — the same "update doubles as the
  // claim" idea claimDueReminders() uses for the unrelated payment-reminder
  // column, adapted here for a value column rather than a null check.
  const query = supabase
    .from("subscriptions")
    .update({ expiry_reminder_sent_at: now.toISOString() })
    .eq("id", subscription.id);

  const { data, error } = subscription.expiry_reminder_sent_at
    ? await query.eq("expiry_reminder_sent_at", subscription.expiry_reminder_sent_at).select("id")
    : await query.is("expiry_reminder_sent_at", null).select("id");

  if (error) {
    console.error("Subscription expiry cron: failed to claim reminder slot", subscription.id, error);
    return false;
  }

  return (data ?? []).length > 0;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const now = new Date();

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("id, business_id, plan, status, expires_at, expiry_reminder_sent_at")
    .in("status", ["active"])
    .order("expires_at", { ascending: true });

  if (error) {
    console.error("Subscription expiry cron: failed to load subscriptions", error);
    return Response.json({ reminded: 0, locked: 0, failed: 0 }, { status: 500 });
  }

  let reminded = 0;
  let locked = 0;
  let failed = 0;

  for (const subscription of (subscriptions ?? []) as DueSubscription[]) {
    if (!subscription.expires_at) continue;

    // --- Reminder thresholds (spec FR-008/FR-009/FR-010) ---
    const threshold = newlyCrossedThreshold(
      subscription.expires_at,
      subscription.expiry_reminder_sent_at,
      now
    );

    if (threshold) {
      const claimed = await claimReminderSlot(supabase, subscription, now);

      if (claimed) {
        const { data: business, error: businessError } = await supabase
          .from("businesses")
          .select("name, owner_id")
          .eq("id", subscription.business_id)
          .maybeSingle();

        if (businessError || !business) {
          console.error(
            "Subscription expiry cron: could not resolve business",
            subscription.business_id,
            businessError
          );
          failed++;
        } else {
          // businesses.contact_email is nullable and unrelated to login
          // identity (same reasoning as payment-reminders/route.ts) — the
          // auth-admin API is the only way to read auth.users.email
          // server-side here.
          const { data: ownerData, error: ownerError } = await supabase.auth.admin.getUserById(
            business.owner_id
          );

          if (ownerError || !ownerData.user?.email) {
            console.error(
              "Subscription expiry cron: could not resolve owner email",
              business.owner_id,
              ownerError
            );
            failed++;
          } else {
            const result = await sendSubscriptionReminder({
              toEmail: ownerData.user.email,
              businessName: business.name,
              isTrial: subscription.plan === "trial",
              threshold,
            });

            if (result.ok) {
              reminded++;
            } else {
              console.error(
                "Subscription expiry cron: reminder send failed",
                subscription.id,
                result.reason
              );
              failed++;
            }
          }
        }
      }
    }

    // --- Grace-period lockout (spec FR-005/FR-007) ---
    if (!isWithinGrace(subscription.expires_at, now)) {
      const { data: lockedRows, error: lockError } = await supabase
        .from("subscriptions")
        .update({ status: "expired" })
        .eq("id", subscription.id)
        .eq("status", subscription.status) // no-op if a concurrent run already transitioned it
        .select("id");

      if (lockError) {
        console.error("Subscription expiry cron: failed to lock subscription", subscription.id, lockError);
        failed++;
      } else if ((lockedRows ?? []).length > 0) {
        locked++;
      }
    }
  }

  return Response.json({ reminded, locked, failed });
}
