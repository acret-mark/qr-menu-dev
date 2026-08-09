"use server";

import { createClient } from "@/lib/supabase/server";
import { sendActivationConfirmation } from "@/lib/email/send-activation-confirmation";
import { invalidateMenuCache } from "@/lib/menu/cache";
import type { PlanType, TicketStatus } from "./types";

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
 * this one does (GMAIL_SMTP_APP_PASSWORD, since 2026-08-09's Resend → Google
 * SMTP migration — specs/024-email-notifications FR-012), which must never
 * reach client code, so
 * the mutation + email send both have to run server-side in one place.
 *
 * Calls the security-definer activate_subscription() RPC added in
 * schema-change-request.md (merged by Mark, 2026-08-03) — see
 * supabase/migrations/20260803000000_add_activate_subscription_fn.sql.
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

  // Newly-activated business — invalidate its cached public menu (see
  // specs/016-menu-data-caching FR-009) so the inactive-menu screen doesn't
  // linger for up to 5s after activation. Cross-boundary note: this touches
  // the admin actions file (Helper 2's territory per SRS §12.5) from a
  // Helper-1-owned caching feature — flagged for review awareness.
  const { data: activatedBusiness } = await supabase
    .from("businesses")
    .select("slug")
    .eq("id", data.business_id)
    .maybeSingle();
  if (activatedBusiness) {
    invalidateMenuCache(activatedBusiness.slug);
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

export type ReplyToSupportTicketResult = { ok: true } | { ok: false; reason: "empty-reply" | string };

/**
 * Writes the ticket's single admin reply, overwriting any previous one in
 * place — the schema holds exactly one admin_reply/replied_at pair, never a
 * thread (spec.md FR-007). Defaults status to "resolved" unless the caller
 * passes an explicit override (FR-009) — the admin's status control, if set
 * to something else at send time, wins over this default.
 */
export async function replyToSupportTicket(input: {
  ticketId: string;
  reply: string;
  status?: TicketStatus;
}): Promise<ReplyToSupportTicketResult> {
  const reply = input.reply.trim();
  if (!reply) {
    return { ok: false, reason: "empty-reply" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("support_tickets")
    .update({
      admin_reply: reply,
      replied_at: new Date().toISOString(),
      status: input.status ?? "resolved",
    })
    .eq("id", input.ticketId);

  if (error) {
    return { ok: false, reason: error.message };
  }

  return { ok: true };
}

export type SetTicketStatusResult = { ok: true } | { ok: false; reason: string };

/**
 * Status-only update — the payload never includes admin_reply/replied_at, so
 * this action is structurally incapable of disturbing an existing reply
 * (FR-011). Independent of replyToSupportTicket: usable at any time, e.g. to
 * mark in_progress before any reply exists, or to reopen a resolved ticket.
 */
export async function setTicketStatus(input: {
  ticketId: string;
  status: TicketStatus;
}): Promise<SetTicketStatusResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("support_tickets")
    .update({ status: input.status })
    .eq("id", input.ticketId);

  if (error) {
    return { ok: false, reason: error.message };
  }

  return { ok: true };
}
