import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ResetLinkInvalidScreen } from "@/components/auth/reset-link-invalid-screen";
import { ResetLinkErrorScreen } from "@/components/auth/reset-link-error-screen";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

const DEFAULT_TYPE: EmailOtpType = "recovery";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const params = await searchParams;
  const token_hash = params.token_hash;
  const type = (params.type ?? DEFAULT_TYPE) as EmailOtpType;

  const retryHref = `/reset-password?${new URLSearchParams({
    ...(token_hash ? { token_hash } : {}),
    type,
  }).toString()}`;

  if (!token_hash) {
    return <ResetLinkErrorScreen retryHref={retryHref} />;
  }

  let verifyError: { code?: string } | null;
  try {
    const supabase = await createClient();
    const result = await supabase.auth.verifyOtp({ token_hash, type });
    verifyError = result.error;
  } catch {
    return <ResetLinkErrorScreen retryHref={retryHref} />;
  }

  if (!verifyError) {
    return (
      <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-background">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-16 pb-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary font-heading text-xl font-bold text-primary-foreground">
              H
            </div>
            <h1 className="mt-3 font-heading text-2xl font-semibold">Set a new password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a new password for your account.
            </p>
          </div>

          <ResetPasswordForm />
        </div>
      </div>
    );
  }

  if (verifyError.code === "otp_expired") {
    return <ResetLinkInvalidScreen />;
  }

  return <ResetLinkErrorScreen retryHref={retryHref} />;
}
