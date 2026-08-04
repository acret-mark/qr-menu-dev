import { Resend } from "resend";
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

let resendClient: Resend | null = null;

/**
 * First email-sending code in this repo (no prior email-provider usage to follow).
 * Server-only by construction — never import this from a "use client" file,
 * since RESEND_API_KEY must never reach the browser bundle.
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

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.error(
      "Activation-confirmation email not sent: RESEND_API_KEY/RESEND_FROM_EMAIL is not configured"
    );
    return { ok: false, reason: "not-configured" };
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  try {
    const { error } = await resendClient.emails.send({
      to: toEmail,
      from: fromEmail,
      subject: `Your ${businessName} subscription is now active`,
      text: [
        `Good news — your ${PLAN_LABELS[plan]} subscription for ${businessName} has been activated.`,
        "",
        `Billing period: ${formatAdminDate(startsAt)} to ${formatAdminDate(expiresAt)}`,
        "",
        "Your menu is now live. Thanks for choosing Hapag.",
      ].join("\n"),
    });
    if (error) {
      console.error("Failed to send activation-confirmation email", error);
      return { ok: false, reason: "send-failed" };
    }
    return { ok: true };
  } catch (err) {
    console.error("Failed to send activation-confirmation email", err);
    return { ok: false, reason: "send-failed" };
  }
}
