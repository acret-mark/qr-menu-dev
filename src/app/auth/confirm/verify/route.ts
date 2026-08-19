import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createBusinessForOwner } from "@/lib/auth/register";
import { getOwnerBusiness } from "@/lib/auth/login";

const DEFAULT_TYPE: EmailOtpType = "email";
const DEFAULT_NEXT = "/business-profile";

// Verifying the confirmation token has to happen here, in a Route Handler,
// and not in auth/confirm/page.tsx — Next.js forbids writing cookies from a
// Server Component, so a session created by verifyOtp() there is silently
// discarded (same issue as reset-password/confirm/route.ts). It was less
// visible here because the business row still gets created server-side,
// within this same request, before the session disappears — but the owner
// would land on `next` signed out.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = (searchParams.get("type") ?? DEFAULT_TYPE) as EmailOtpType;
  const next = searchParams.get("next") ?? DEFAULT_NEXT;

  if (!token_hash) {
    return NextResponse.redirect(
      `${origin}/auth/confirm?${new URLSearchParams({ error: "missing", type, next }).toString()}`
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });

  if (error) {
    const errorParam = error.code === "otp_expired" ? "expired" : "unknown";
    return NextResponse.redirect(
      `${origin}/auth/confirm?${new URLSearchParams({
        error: errorParam,
        token_hash,
        type,
        next,
      }).toString()}`
    );
  }

  const verifiedUser = data.user;
  if (verifiedUser) {
    const existingBusiness = await getOwnerBusiness(supabase, verifiedUser.id);
    if (!existingBusiness) {
      const businessName =
        typeof verifiedUser.user_metadata?.business_name === "string"
          ? (verifiedUser.user_metadata.business_name as string)
          : null;

      const creation = businessName
        ? await createBusinessForOwner(
            supabase,
            verifiedUser.id,
            businessName,
            verifiedUser.email ?? ""
          )
        : { ok: false as const, message: "Missing business name." };

      if (!creation.ok) {
        return NextResponse.redirect(`${origin}/auth/confirm?error=business-setup`);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
