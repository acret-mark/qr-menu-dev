import { sendMail } from "./google-smtp-client";

export type SendPaymentReminderInput = {
  toEmail: string;
  businessName: string;
};

export type SendPaymentReminderResult = { ok: true } | { ok: false; reason: string };

/**
 * Same shape as send-welcome-email.ts / send-activation-confirmation.ts.
 * Called only from the payment-reminder cron route
 * (src/app/api/cron/payment-reminders/route.ts) — never from a
 * "use client" file, since GMAIL_SMTP_APP_PASSWORD must never reach the
 * browser bundle.
 *
 * Copy is a nudge only — no implication of a system-enforced deadline
 * (constitution Principle II: no system-enforced trial-expiry logic).
 *
 * Migrated 2026-08-09 from Resend to the shared Google SMTP send-helper
 * (google-smtp-client.ts) per FR-010 — input/output shape unchanged.
 */
export async function sendPaymentReminder({
  toEmail,
  businessName,
}: SendPaymentReminderInput): Promise<SendPaymentReminderResult> {
  return sendMail({
    to: toEmail,
    subject: `Your ${businessName} subscription payment is still awaiting activation`,
    text: [
      `Just a nudge — we haven't yet activated the subscription payment you submitted for ${businessName}.`,
      "",
      "If you've already sent your proof of payment, no action is needed — an admin will review it shortly.",
      "If you haven't submitted proof yet, you can do so from your dashboard.",
      "",
      "Thanks for your patience.",
    ].join("\n"),
  });
}
