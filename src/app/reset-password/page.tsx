import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ResetLinkInvalidScreen } from "@/components/auth/reset-link-invalid-screen";
import { ResetLinkErrorScreen } from "@/components/auth/reset-link-error-screen";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

// Auth pages are functional-only and never meant to surface in search
// results (specs/033 FR-009).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const DEFAULT_TYPE = "recovery";

// Token verification happens in reset-password/confirm/route.ts (a Route
// Handler, which can persist the session via cookies) before the browser
// ever lands here. This page just checks whether that left behind a real
// session — see the comment in confirm/route.ts for why it can't do the
// verifyOtp call itself.
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; token_hash?: string; type?: string }>;
}) {
  const params = await searchParams;

  if (params.error === "expired") {
    return <ResetLinkInvalidScreen />;
  }

  if (params.error) {
    const retryHref = `/reset-password/confirm?${new URLSearchParams({
      ...(params.token_hash ? { token_hash: params.token_hash } : {}),
      type: params.type ?? DEFAULT_TYPE,
    }).toString()}`;
    return <ResetLinkErrorScreen retryHref={retryHref} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <ResetLinkInvalidScreen />;
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-16 pb-10">
        <div className="flex flex-col items-center text-center">
          <Link href="/">
            <Image src="/logo.png" alt="Hapag" width={128} height={128} priority />
          </Link>
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
