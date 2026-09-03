import { sendMail } from "./google-smtp-client";
import type { ReminderThreshold } from "@/lib/subscription/expiry";

export type SendSubscriptionReminderInput = {
  toEmail: string;
  businessName: string;
  isTrial: boolean;
  threshold: ReminderThreshold;
};

export type SendSubscriptionReminderResult = { ok: true } | { ok: false; reason: string };

const THRESHOLD_TIMING_PHRASE: Record<ReminderThreshold, string> = {
  t7: "in 7 days",
  t1: "tomorrow",
  t0: "today",
};

// Fixed subject regardless of trial/paid or threshold — the body carries
// the specifics; a stable subject also keeps every reminder in one email
// thread client-side.
const SUBJECT = "Subscription Reminder";

/**
 * Same shape as send-payment-reminder.ts / send-activation-confirmation.ts —
 * calls the one shared sendMail() (FR-011a, research.md §3). Two copy
 * variants (trial vs. paid), varying by threshold for the T-0 urgency
 * requirement (spec FR-008/FR-009). Called only from the subscription-expiry
 * cron route (src/app/api/cron/subscription-expiry/route.ts) — never from a
 * "use client" file, since GMAIL_SMTP_APP_PASSWORD must never reach the
 * browser bundle.
 *
 * Sends both `text` and `html` (google-smtp-client.ts's `html` param, unused
 * by every other template here) so the reminder reads as a structured
 * notice — heading, expiry line, a distinct action step, and an inline-styled
 * urgency callout for T-0 — rather than a plain paragraph.
 */
export async function sendSubscriptionReminder({
  toEmail,
  businessName,
  isTrial,
  threshold,
}: SendSubscriptionReminderInput): Promise<SendSubscriptionReminderResult> {
  const timing = THRESHOLD_TIMING_PHRASE[threshold];
  const kind = isTrial ? "trial" : "subscription";
  const expiryVerb = isTrial ? "ends" : "expires";

  const action = isTrial
    ? "Upgrade to a paid plan from your dashboard's subscription tab to keep editing your menu without interruption."
    : "Submit your renewal payment from your dashboard's subscription tab so an admin can confirm it before your access is restricted.";

  // T-0 urgency copy (spec FR-009): the day-of email additionally states that
  // edit access will be restricted in 3 days (the grace period) if nothing
  // changes — existing menu/QR viewing and the public menu are unaffected,
  // only editing.
  const urgency =
    threshold === "t0"
      ? "If this isn't renewed/confirmed today, editing your menu will be restricted in 3 days. " +
        "Your existing menu and QR codes will keep working for your customers the whole time — only editing is affected."
      : null;

  const text = [
    `Your ${businessName} ${kind} on Hapag ${expiryVerb} ${timing}.`,
    "",
    `Next step: ${action}`,
    ...(urgency ? ["", `Urgent: ${urgency}`] : []),
  ].join("\n");

  const html = `
<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
  <h2 style="margin:0 0 16px;font-size:18px;font-weight:600">Subscription Reminder</h2>
  <p style="margin:0 0 16px;font-size:14px;line-height:1.5">
    Your <strong>${businessName}</strong> ${kind} on Hapag <strong>${expiryVerb} ${timing}</strong>.
  </p>
  <p style="margin:0 0 16px;font-size:14px;line-height:1.5;padding:12px 16px;background:#f5f5f5;border-radius:8px">
    <strong>Next step:</strong> ${action}
  </p>
  ${
    urgency
      ? `<p style="margin:0;font-size:13px;line-height:1.5;padding:12px 16px;background:#fdecea;border-left:3px solid #d93025;border-radius:4px">
    <strong>Urgent:</strong> ${urgency}
  </p>`
      : ""
  }
</div>`.trim();

  return sendMail({ to: toEmail, subject: SUBJECT, text, html });
}
