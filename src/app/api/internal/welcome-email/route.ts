import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email/send-welcome-email";

type WelcomeEmailRequestBody = {
  toEmail: string;
  businessName: string;
};

function isValidBody(value: unknown): value is WelcomeEmailRequestBody {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).toEmail === "string" &&
    typeof (value as Record<string, unknown>).businessName === "string"
  );
}

/**
 * Exists solely so createBusinessForOwner()'s client-side call path
 * (register.ts's triggerWelcomeEmail(), invoked from register-form.tsx via
 * the browser Supabase client) can reach a real server context to send the
 * welcome email — GMAIL_SMTP_APP_PASSWORD (and nodemailer itself) must
 * never reach the browser bundle. Not intended for general/public use
 * beyond that one caller — no auth guard, since the only side effect is
 * triggering an email send with data the caller already legitimately
 * possesses (their own registration details).
 */
export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid-body" }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json({ ok: false, reason: "invalid-body" }, { status: 400 });
  }

  const result = await sendWelcomeEmail(body);
  return NextResponse.json(result);
}
