import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Verifying the recovery token has to happen here, in a Route Handler, and
// not in reset-password/page.tsx — Next.js forbids writing cookies from a
// Server Component, so a session created by verifyOtp() there is silently
// discarded and the client-side updateUser() call later fails with "Auth
// session missing". Route Handlers can set cookies, so the session survives
// the redirect back to /reset-password.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = (searchParams.get("type") ?? "recovery") as EmailOtpType;

  if (!token_hash) {
    return NextResponse.redirect(`${origin}/reset-password?error=missing`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash, type });

  if (!error) {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  const errorParam = error.code === "otp_expired" ? "expired" : "unknown";
  return NextResponse.redirect(
    `${origin}/reset-password?${new URLSearchParams({
      error: errorParam,
      token_hash,
      type,
    }).toString()}`
  );
}
