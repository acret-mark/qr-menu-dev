import { sendMail } from "./google-smtp-client";
import { formatAdminDate } from "@/lib/admin/format";
import type { PlanType } from "@/lib/admin/types";

const PLAN_LABELS: Record<PlanType, string> = {
  standard: "Standard",
  pro: "Pro",
};

export type SendActivationConfirmationInput = {
  toEmail: string | null;
  businessName: string;
  plan: PlanType;
  startsAt: string;
  expiresAt: string;
};

export type SendActivationConfirmationResult = { ok: true } | { ok: false; reason: string };

/**
 * First email-sending code in this repo (no prior email-provider usage to follow).
 * Server-only by construction — never import this from a "use client" file,
 * since GMAIL_SMTP_APP_PASSWORD must never reach the browser bundle.
 *
 * Migrated 2026-08-09 (specs/024-email-notifications FR-012) from Resend to
 * the shared Google SMTP send-helper (google-smtp-client.ts) — signature,
 * recipient logic (businesses.contact_email, nullable), and the caller
 * (activateSubscription() in src/lib/admin/actions.ts) are unchanged; only
 * this file's internals move. See
 * specs/024-email-notifications/contracts/activation-confirmation-contract.md.
 */
export async function sendActivationConfirmation({
  toEmail,
  businessName,
  plan,
  startsAt,
  expiresAt,
}: SendActivationConfirmationInput): Promise<SendActivationConfirmationResult> {
  // A data-quality gap (business has no contact email), not a system failure —
  // the caller has already committed the activation and must not treat this
  // as a reason to undo it (FR-011).
  if (!toEmail) {
    return { ok: false, reason: "no-contact-email" };
  }

  return sendMail({
    to: toEmail,
    subject: `Your ${businessName} subscription is now active`,
    text: [
      `Good news — your ${PLAN_LABELS[plan]} subscription for ${businessName} has been activated.`,
      "",
      `Billing period: ${formatAdminDate(startsAt)} to ${formatAdminDate(expiresAt)}`,
      "",
      "Your menu is now live. Thanks for choosing Hapag.",
    ].join("\n"),
  });
}
