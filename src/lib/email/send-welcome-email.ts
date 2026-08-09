import { sendMail } from "./google-smtp-client";

export type SendWelcomeEmailInput = {
  toEmail: string;
  businessName: string;
};

export type SendWelcomeEmailResult = { ok: true } | { ok: false; reason: string };

/**
 * Mirrors send-activation-confirmation.ts's shape. Unlike that function,
 * toEmail here is never null — the caller (createBusinessForOwner) only ever
 * has the owner's real Supabase Auth email to pass, not the optional,
 * unset-at-registration businesses.contact_email (see research.md §1).
 * Server-only by construction — never import this from a "use client" file,
 * since GMAIL_SMTP_APP_PASSWORD must never reach the browser bundle.
 *
 * Migrated 2026-08-09 from Resend to the shared Google SMTP send-helper
 * (google-smtp-client.ts) per FR-010 — input/output shape unchanged.
 */
export async function sendWelcomeEmail({
  toEmail,
  businessName,
}: SendWelcomeEmailInput): Promise<SendWelcomeEmailResult> {
  return sendMail({
    to: toEmail,
    subject: `Welcome to Hapag, ${businessName}!`,
    text: [
      `Welcome aboard — ${businessName} is now set up on Hapag.`,
      "",
      "Next step: build your menu by adding categories and items, then generate your QR code so customers can start ordering.",
      "",
      "Thanks for choosing Hapag.",
    ].join("\n"),
  });
}
