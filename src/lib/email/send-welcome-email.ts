import { sendMail } from "./google-smtp-client";

export type SendWelcomeEmailInput = {
  toEmail: string;
  businessName: string;
};

export type SendWelcomeEmailResult = { ok: true } | { ok: false; reason: string };

// No canonical site-base-URL constant exists elsewhere in this repo yet
// (hapag.ph isn't registered — SRS §12.8 — and the app's own host differs
// across local/preview/production). NEXT_PUBLIC_SITE_URL is new as of
// 2026-08-09, added specifically so this email can link somewhere real;
// falls back to the local dev server so this doesn't silently omit the
// link (and doesn't throw) if the var is ever unset.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
 *
 * Copy revised 2026-08-09: added a /login link. The original copy pointed
 * the owner toward "next step: build your menu" in words only, with no
 * actual URL — confirmed missing via a real manual test send. Links to
 * /login rather than a page like /business-profile because it's correct
 * regardless of session state — if the email is opened later or on a
 * different device, a direct deep link to an authenticated page would
 * just bounce to /login anyway; this skips that round-trip for the one
 * case (same device, live session) where it would have worked, in favor
 * of being unconditionally correct.
 */
export async function sendWelcomeEmail({
  toEmail,
  businessName,
}: SendWelcomeEmailInput): Promise<SendWelcomeEmailResult> {
  const loginUrl = `${SITE_URL}/login`;
  return sendMail({
    to: toEmail,
    subject: `Welcome to Hapag, ${businessName}!`,
    text: [
      `Welcome aboard — ${businessName} is now set up on Hapag.`,
      "",
      "Next step: build your menu by adding categories and items, then generate your QR code so customers can start ordering.",
      "",
      `Log in here to get started: ${loginUrl}`,
      "",
      "Thanks for choosing Hapag.",
    ].join("\n"),
  });
}
