import { Resend } from "resend";

export type SendPaymentReminderInput = {
  toEmail: string;
  businessName: string;
};

export type SendPaymentReminderResult = { ok: true } | { ok: false; reason: string };

let resendClient: Resend | null = null;

/**
 * Same shape as send-welcome-email.ts / send-activation-confirmation.ts.
 * Called only from the payment-reminder cron route
 * (src/app/api/cron/payment-reminders/route.ts) — never from a
 * "use client" file, since RESEND_API_KEY must never reach the browser
 * bundle.
 *
 * Copy is a nudge only — no implication of a system-enforced deadline
 * (constitution Principle II: no system-enforced trial-expiry logic).
 */
export async function sendPaymentReminder({
  toEmail,
  businessName,
}: SendPaymentReminderInput): Promise<SendPaymentReminderResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.error("Payment-reminder email not sent: RESEND_API_KEY/RESEND_FROM_EMAIL is not configured");
    return { ok: false, reason: "not-configured" };
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  try {
    const { error } = await resendClient.emails.send({
      to: toEmail,
      from: fromEmail,
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
    if (error) {
      console.error("Failed to send payment-reminder email", error);
      return { ok: false, reason: "send-failed" };
    }
    return { ok: true };
  } catch (err) {
    console.error("Failed to send payment-reminder email", err);
    return { ok: false, reason: "send-failed" };
  }
}
