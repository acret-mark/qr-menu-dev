import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { LinkInvalidScreen } from "@/components/auth/link-invalid-screen";
import { ConfirmationErrorScreen } from "@/components/auth/confirmation-error-screen";

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

  let verifyError: { code?: string } | null;
  try {
    const supabase = await createClient();
    const result = await supabase.auth.verifyOtp({ token_hash, type });
    verifyError = result.error;
  } catch {
    return <ConfirmationErrorScreen retryHref={retryHref} />;
  }

  if (!verifyError) {
    redirect(next);
  }

  if (verifyError.code === "otp_expired") {
    return <LinkInvalidScreen />;
  }

  return <ConfirmationErrorScreen retryHref={retryHref} />;
}
