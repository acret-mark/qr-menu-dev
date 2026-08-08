import { Resend } from "resend";

export type SendWelcomeEmailInput = {
  toEmail: string;
  businessName: string;
};

export type SendWelcomeEmailResult = { ok: true } | { ok: false; reason: string };

let resendClient: Resend | null = null;

/**
 * Mirrors send-activation-confirmation.ts's shape. Unlike that function,
 * toEmail here is never null — the caller (createBusinessForOwner) only ever
 * has the owner's real Supabase Auth email to pass, not the optional,
 * unset-at-registration businesses.contact_email (see research.md §1).
 * Server-only by construction — never import this from a "use client" file,
 * since RESEND_API_KEY must never reach the browser bundle.
 */
export async function sendWelcomeEmail({
  toEmail,
  businessName,
}: SendWelcomeEmailInput): Promise<SendWelcomeEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.error("Welcome email not sent: RESEND_API_KEY/RESEND_FROM_EMAIL is not configured");
    return { ok: false, reason: "not-configured" };
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  try {
    const { error } = await resendClient.emails.send({
      to: toEmail,
      from: fromEmail,
      subject: `Welcome to Hapag, ${businessName}!`,
      text: [
        `Welcome aboard — ${businessName} is now set up on Hapag.`,
        "",
        "Next step: build your menu by adding categories and items, then generate your QR code so customers can start ordering.",
        "",
        "Thanks for choosing Hapag.",
      ].join("\n"),
    });
    if (error) {
      console.error("Failed to send welcome email", error);
      return { ok: false, reason: "send-failed" };
    }
    return { ok: true };
  } catch (err) {
    console.error("Failed to send welcome email", err);
    return { ok: false, reason: "send-failed" };
  }
}
