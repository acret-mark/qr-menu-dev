import type { SupabaseClient } from "@supabase/supabase-js";
import { randomSlug, slugify } from "./slug";

// NOT a static top-level import of "@/lib/email/send-welcome-email" — that
// file (and the google-smtp-client.ts it calls through) transitively pulls
// in `nodemailer`, which requires Node built-ins (child_process, net, tls,
// dns) that don't exist in a browser bundle. This file is reachable from
// register-form.tsx ("use client"), so a static import here breaks the
// production build outright (not just a silent runtime no-op, the way the
// Resend SDK's fetch-based client tolerated being bundled-but-unused).
// See triggerWelcomeEmail() below.

const MAX_SLUG_ATTEMPTS = 25;

export type RegisterOwnerInput = {
  businessName: string;
  email: string;
  password: string;
};

export type RegisterOwnerResult =
  | { ok: true }
  | { ok: false; stage: "duplicate-email" | "auth" | "business"; message: string };

export type CreateBusinessResult = { ok: true } | { ok: false; message: string };

export const BUSINESS_SETUP_FAILED_MESSAGE =
  "Your account was created, but we couldn't finish setting up your business. Please contact support.";

// Fire-and-forget from the caller's perspective: a welcome-email send
// failure must never turn a successful business creation into a failure
// result (FR-002). Awaited here only so the send is attempted before
// createBusinessForOwner() returns, not so its outcome can block anything.
//
// Server-side (typeof window === "undefined"): dynamically imports
// send-welcome-email.ts and calls it directly — safe here, since this
// branch only ever executes in a Node/server runtime (Server Component,
// Server Action, Route Handler), never in the browser.
// Client-side: this function runs inside the browser bundle, so it can
// never import send-welcome-email.ts (see the note at the top of this
// file) — it POSTs to the internal route instead, which runs the actual
// send in a real server context.
async function triggerWelcomeEmail(toEmail: string, businessName: string): Promise<void> {
  if (typeof window === "undefined") {
    const { sendWelcomeEmail } = await import("@/lib/email/send-welcome-email");
    await sendWelcomeEmail({ toEmail, businessName });
    return;
  }

  try {
    await fetch("/api/internal/welcome-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toEmail, businessName }),
    });
  } catch (err) {
    console.error("Failed to trigger welcome email via internal route", err);
  }
}

// Shared by registerOwner (used when signUp returns a session immediately,
// i.e. email confirmation is off) and /auth/confirm (used when it doesn't,
// since the RLS insert policy needs an authenticated owner_id = auth.uid()).
export async function createBusinessForOwner(
  supabase: SupabaseClient,
  ownerId: string,
  businessName: string,
  ownerEmail: string
): Promise<CreateBusinessResult> {
  const baseSlug = slugify(businessName) || randomSlug();
  let candidate = baseSlug;
  let suffix = 1;

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const { error: insertError } = await supabase.from("businesses").insert({
      name: businessName,
      slug: candidate,
      owner_id: ownerId,
      status: "pending",
      plan: "standard",
    });

    if (!insertError) {
      await triggerWelcomeEmail(ownerEmail, businessName);
      return { ok: true };
    }

    if (insertError.code === "23505") {
      suffix += 1;
      candidate = `${baseSlug}-${suffix}`;
      continue;
    }

    console.error("Failed to create business row for owner", ownerId, insertError);
    return { ok: false, message: BUSINESS_SETUP_FAILED_MESSAGE };
  }

  console.error("Exhausted slug attempts for owner", ownerId, businessName);
  return { ok: false, message: BUSINESS_SETUP_FAILED_MESSAGE };
}

export async function registerOwner(
  supabase: SupabaseClient,
  { businessName, email, password }: RegisterOwnerInput
): Promise<RegisterOwnerResult> {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    // Carried on the auth user so /auth/confirm can create the business row
    // once a session actually exists, if signUp itself doesn't return one.
    options: { data: { business_name: businessName } },
  });

  if (signUpError) {
    if (/already registered|already exists/i.test(signUpError.message)) {
      return {
        ok: false,
        stage: "duplicate-email",
        message: "An account with this email already exists.",
      };
    }
    return { ok: false, stage: "auth", message: signUpError.message };
  }

  // Supabase signs up an "existing" user with an empty identities array
  // (no error) when email-enumeration protection is on, instead of
  // reporting a conflict directly.
  if (signUpData.user && signUpData.user.identities?.length === 0) {
    return {
      ok: false,
      stage: "duplicate-email",
      message: "An account with this email already exists.",
    };
  }

  const ownerId = signUpData.user?.id;
  if (!ownerId) {
    return { ok: false, stage: "auth", message: "Could not create your account. Please try again." };
  }

  // No session means email confirmation is required — there's no auth.uid()
  // yet for the "owners can insert own business" RLS policy to match against.
  // /auth/confirm creates the business row once the owner is actually signed in.
  if (!signUpData.session) {
    return { ok: true };
  }

  const result = await createBusinessForOwner(supabase, ownerId, businessName, email);
  if (!result.ok) {
    return { ok: false, stage: "business", message: result.message };
  }

  return { ok: true };
}
