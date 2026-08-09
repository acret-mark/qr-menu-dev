import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type SendMailResult = { ok: true } | { ok: false; reason: string };

let transporter: Transporter | null = null;

/**
 * The one shared Google SMTP transport all three email types (welcome,
 * payment reminder, activation confirmation) send through — per FR-010,
 * migrated 2026-08-09 from three independent Resend clients (see
 * research.md §7). `from` is always GMAIL_SMTP_USER itself; unlike Resend,
 * there is no separate from-address env var, since Google SMTP sends as
 * the authenticated account.
 *
 * Server-only by construction — never import this from a "use client"
 * file, since GMAIL_SMTP_APP_PASSWORD must never reach the browser bundle.
 */
export async function sendMail({
  to,
  subject,
  text,
  html,
}: SendMailInput): Promise<SendMailResult> {
  const user = process.env.GMAIL_SMTP_USER;
  const appPassword = process.env.GMAIL_SMTP_APP_PASSWORD;

  if (!user || !appPassword) {
    console.error(
      "Email not sent: GMAIL_SMTP_USER/GMAIL_SMTP_APP_PASSWORD is not configured"
    );
    return { ok: false, reason: "not-configured" };
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass: appPassword },
    });
  }

  try {
    await transporter.sendMail({
      to,
      from: user,
      subject,
      text,
      ...(html ? { html } : {}),
    });
    return { ok: true };
  } catch (err) {
    console.error("Failed to send email via Google SMTP", err);
    return { ok: false, reason: "send-failed" };
  }
}
