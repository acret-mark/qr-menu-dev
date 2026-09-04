"use server";

import { createClient } from "@/lib/supabase/server";
import { sendActivationConfirmation } from "@/lib/email/send-activation-confirmation";
import { invalidateMenuCache } from "@/lib/menu/cache";
import type { BusinessStatus, PlanType, TicketStatus } from "./types";

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

export type SetBusinessStatusAndPlanInput = {
  businessId: string;
  status: BusinessStatus;
  plan: PlanType;
  slug: string;
};

export type SetBusinessStatusAndPlanResult = { ok: true } | { ok: false; reason: "not-authenticated" | string };

/**
 * General-purpose admin override, independent of activateSubscription() — sets
 * status and plan together on any business, with no payment proof and no
 * subscriptions row (specs/031-admin-status-plan-override). Also this app's only
 * path to `status: "trial"` or `status: "suspended"` now, since the dedicated
 * grantTrial()/suspendBusiness() actions were both removed as redundant (amended
 * 2026-08-26 — first Suspend, then Grant Trial). Single-table update: no second
 * table to keep in sync, so no RPC is needed. Invalidates the public menu cache
 * unconditionally, since both status (visibility) and plan (rendering) can change
 * what /menu/{slug} would show (research.md §6).
 *
 * EXTENDED for specs/032-unified-subscription-lifecycle (T012): a trial grant
 * now also needs a real `subscriptions` row, since `subscriptions.expires_at`
 * is the unified lifecycle's sole expiry source of truth (spec FR-003) — a
 * business flipped to `status: "trial"` with no subscription row would never
 * be picked up by the expiry cron and would sit at full access forever. When
 * `input.status === "trial"`, this calls the `grant_trial_subscription()` RPC
 * (T001, 20260902020000_add_grant_trial_subscription_fn.sql) — a sibling to
 * `activate_subscription()`, not an extension of it, since a trial grant has
 * neither a pending row nor a payment amount to activate. That RPC already
 * sets `businesses.status = 'trial'` itself; `input.plan` is applied in a
 * second, separate update here since the RPC has no plan parameter.
 *
 * FOLLOW-UP for 032: `status: "active"` has the same problem `trial` did —
 * a business whose latest subscription is `expired` (locked) previously
 * just got `businesses.status` flipped back to "active" with the stale
 * expired row left as the latest one the access gate reads, so the lock
 * silently never lifted despite the control looking like it succeeded.
 * Fixed the same way: when there's no currently-live subscription (none, or
 * the latest one isn't `active`), this calls the new
 * `grant_active_subscription()` RPC (20260904000000) — same admin-override
 * trust model as the trial grant, just for a paid plan — which creates a
 * fresh active row and actually lifts the lock. When a live subscription
 * already exists (the common case: admin is just correcting
 * status/plan on an already-healthy business), this deliberately falls
 * through to the plain direct write below instead, so a real, longer-dated
 * paid subscription is never superseded by a $0 admin-override row.
 *
 * Every other status (pending/suspended) keeps the original direct
 * single-table write, unchanged — no subscriptions row is created or
 * required there (specs/031-admin-status-plan-override's FR-002-equivalent
 * guarantee).
 */
export async function setBusinessStatusAndPlan(
  input: SetBusinessStatusAndPlanInput
): Promise<SetBusinessStatusAndPlanResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "not-authenticated" };
  }

  if (input.status === "trial") {
    // One calendar month from grant time — the same fixed reference window
    // Constitution Principle II's trial-grant clarification already
    // established for admin-granted trials (mirrored by T001's backfill
    // migration's fallback for businesses with no trial_ends_at).
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { error: grantError } = await supabase.rpc("grant_trial_subscription", {
      p_business_id: input.businessId,
      p_admin_id: user.id,
      p_expires_at: expiresAt.toISOString(),
    });

    if (grantError) {
      return { ok: false, reason: grantError.message };
    }

    const { error: planError } = await supabase
      .from("businesses")
      .update({ plan: input.plan })
      .eq("id", input.businessId);

    if (planError) {
      return { ok: false, reason: planError.message };
    }

    invalidateMenuCache(input.slug);

    return { ok: true };
  }

  if (input.status === "active") {
    const { data: latest } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("business_id", input.businessId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const hasLiveSubscription = latest?.status === "active";

    if (!hasLiveSubscription) {
      // Same fixed one-month reference window as the trial grant.
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error: grantError } = await supabase.rpc("grant_active_subscription", {
        p_business_id: input.businessId,
        p_admin_id: user.id,
        p_plan: input.plan,
        p_expires_at: expiresAt.toISOString(),
      });

      if (grantError) {
        return { ok: false, reason: grantError.message };
      }

      invalidateMenuCache(input.slug);

      return { ok: true };
    }
  }

  const { error } = await supabase
    .from("businesses")
    .update({ status: input.status, plan: input.plan })
    .eq("id", input.businessId);

  if (error) {
    return { ok: false, reason: error.message };
  }

  invalidateMenuCache(input.slug);

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
