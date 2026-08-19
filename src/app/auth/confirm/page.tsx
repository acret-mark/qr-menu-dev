import { LinkInvalidScreen } from "@/components/auth/link-invalid-screen";
import { ConfirmationErrorScreen } from "@/components/auth/confirmation-error-screen";
import { BusinessSetupFailedScreen } from "@/components/auth/business-setup-failed-screen";

const DEFAULT_TYPE = "email";
const DEFAULT_NEXT = "/business-profile";

// The happy path never renders this page — auth/confirm/verify/route.ts
// verifies the token and redirects straight to `next` once a real session
// is persisted (see the comment there for why verification can't happen in
// this Server Component). This page only ever shows the failure states.
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; token_hash?: string; type?: string; next?: string }>;
}) {
  const params = await searchParams;

  if (params.error === "expired") {
    return <LinkInvalidScreen />;
  }

  if (params.error === "business-setup") {
    return <BusinessSetupFailedScreen />;
  }

  const retryHref = `/auth/confirm/verify?${new URLSearchParams({
    ...(params.token_hash ? { token_hash: params.token_hash } : {}),
    type: params.type ?? DEFAULT_TYPE,
    next: params.next ?? DEFAULT_NEXT,
  }).toString()}`;

  return <ConfirmationErrorScreen retryHref={retryHref} />;
}
