"use server";

import { createClient } from "@/lib/supabase/server";
import { sendActivationConfirmation } from "@/lib/email/send-activation-confirmation";
import type { PlanType } from "./types";

export type ActivateSubscriptionInput = {
  subscriptionId: string;
  plan: PlanType;
  startsAt: string;
  expiresAt: string;
  businessName: string;
  contactEmail: string | null;
};

export type ActivateSubscriptionResult =
  | { ok: true; alreadyActive: boolean; emailSent: boolean }
  | { ok: false; reason: string };

/**
 * Server Action, not a browser-client call — deliberately deviating from
 * registerOwner()'s client-component + browser-client convention (see
 * research.md §2). That precedent has no server-only secret in its path;
 * this one does (SENDGRID_API_KEY), which must never reach client code, so
 * the mutation + email send both have to run server-side in one place.
 *
 * Calls the security-definer activate_subscription() RPC proposed in
 * schema-change-request.md, so this function does nothing correct until
 * that migration is merged — see the plan's flagged Constitution Principle
 * III dependency.
 */
export async function activateSubscription(
  input: ActivateSubscriptionInput
): Promise<ActivateSubscriptionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "not-authenticated" };
  }

  const { data, error } = await supabase.rpc("activate_subscription", {
    p_subscription_id: input.subscriptionId,
    p_admin_id: user.id,
    p_plan: input.plan,
    p_starts_at: input.startsAt,
    p_expires_at: input.expiresAt,
  });

  if (error) {
    return { ok: false, reason: error.message };
  }

  // The RPC's own conditional `where status = 'pending'` update returns null
  // when it matched zero rows — the subscription was already non-pending.
  // Safe no-op per FR-007: no email, no error.
  if (!data) {
    return { ok: true, alreadyActive: true, emailSent: false };
  }

  const emailResult = await sendActivationConfirmation({
    toEmail: input.contactEmail,
    businessName: input.businessName,
    plan: input.plan,
    startsAt: input.startsAt,
    expiresAt: input.expiresAt,
  });

  return { ok: true, alreadyActive: false, emailSent: emailResult.ok };
}

export type RejectSubscriptionResult = { ok: true } | { ok: false; reason: string };

/**
 * Single-table conditional update — no RPC dependency, no atomicity concern,
 * no email. Rejection leaves the business exactly as it was (spec.md
 * Assumptions).
 */
export async function rejectSubscription(input: {
  subscriptionId: string;
}): Promise<RejectSubscriptionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("id", input.subscriptionId)
    .eq("status", "pending");

  if (error) {
    return { ok: false, reason: error.message };
  }

  return { ok: true };
}
