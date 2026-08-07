import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createBusinessForOwner } from "@/lib/auth/register";
import { getOwnerBusiness } from "@/lib/auth/login";
import { LinkInvalidScreen } from "@/components/auth/link-invalid-screen";
import { ConfirmationErrorScreen } from "@/components/auth/confirmation-error-screen";
import { BusinessSetupFailedScreen } from "@/components/auth/business-setup-failed-screen";

const DEFAULT_TYPE: EmailOtpType = "email";
const DEFAULT_NEXT = "/business-profile";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string }>;
}) {
  const params = await searchParams;
  const token_hash = params.token_hash;
  const type = (params.type ?? DEFAULT_TYPE) as EmailOtpType;
  const next = params.next ?? DEFAULT_NEXT;

  const retryHref = `/auth/confirm?${new URLSearchParams({
    ...(token_hash ? { token_hash } : {}),
    type,
    next,
  }).toString()}`;

  if (!token_hash) {
    return <ConfirmationErrorScreen retryHref={retryHref} />;
  }

  const supabase = await createClient();

  let verifyError: { code?: string } | null;
  let verifiedUser: Awaited<ReturnType<typeof supabase.auth.verifyOtp>>["data"]["user"] = null;
  try {
    const result = await supabase.auth.verifyOtp({ token_hash, type });
    verifyError = result.error;
    verifiedUser = result.data.user;
  } catch {
    return <ConfirmationErrorScreen retryHref={retryHref} />;
  }

  if (!verifyError) {
    // signUp couldn't create the business row before confirmation (no
    // session existed yet for the RLS insert policy to authorize) — finish
    // that here now that the owner is actually signed in.
    if (verifiedUser) {
      const existingBusiness = await getOwnerBusiness(supabase, verifiedUser.id);
      if (!existingBusiness) {
        const businessName =
          typeof verifiedUser.user_metadata?.business_name === "string"
            ? (verifiedUser.user_metadata.business_name as string)
            : null;

        const creation = businessName
          ? await createBusinessForOwner(supabase, verifiedUser.id, businessName)
          : { ok: false as const, message: "Missing business name." };

        if (!creation.ok) {
          return <BusinessSetupFailedScreen />;
        }
      }
    }

    redirect(next);
  }

  if (verifyError.code === "otp_expired") {
    return <LinkInvalidScreen />;
  }

  return <ConfirmationErrorScreen retryHref={retryHref} />;
}
