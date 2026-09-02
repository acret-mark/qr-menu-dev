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

/**
 * Same shape as send-payment-reminder.ts / send-activation-confirmation.ts —
 * calls the one shared sendMail() (FR-011a, research.md §3). Two copy
 * variants (trial vs. paid), varying by threshold for the T-0 urgency
 * requirement (spec FR-008/FR-009). Called only from the subscription-expiry
 * cron route (src/app/api/cron/subscription-expiry/route.ts) — never from a
 * "use client" file, since GMAIL_SMTP_APP_PASSWORD must never reach the
 * browser bundle.
 */
export async function sendSubscriptionReminder({
  toEmail,
  businessName,
  isTrial,
  threshold,
}: SendSubscriptionReminderInput): Promise<SendSubscriptionReminderResult> {
  const timing = THRESHOLD_TIMING_PHRASE[threshold];

  const subject = isTrial
    ? `Your ${businessName} trial ends ${timing}`
    : `Your ${businessName} subscription expires ${timing}`;

  const bodyLines = isTrial
    ? [
        `Your ${businessName} trial on Hapag ends ${timing}.`,
        "",
        "Upgrade to a paid plan from your dashboard's subscription tab to keep editing your menu without interruption.",
      ]
    : [
        `Your ${businessName} subscription on Hapag expires ${timing}.`,
        "",
        "Submit your renewal payment from your dashboard's subscription tab so an admin can confirm it before your access is restricted.",
      ];

  // T-0 urgency copy (spec FR-009): the day-of email additionally states that
  // edit access will be restricted in 3 days (the grace period) if nothing
  // changes — existing menu/QR viewing and the public menu are unaffected,
  // only editing.
  const urgencyLines =
    threshold === "t0"
      ? [
          "",
          "If this isn't renewed/confirmed today, editing your menu will be restricted in 3 days. " +
            "Your existing menu and QR codes will keep working for your customers the whole time — only editing is affected.",
        ]
      : [];

  return sendMail({
    to: toEmail,
    subject,
    text: [...bodyLines, ...urgencyLines].join("\n"),
  });
}
