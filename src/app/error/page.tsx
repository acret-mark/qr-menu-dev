import { ErrorState } from "@/components/system/error-state";

// The destination `ERROR_PATH` ("/error", src/lib/auth/login.ts) already
// points to from `(owner)/layout.tsx` and `account-suspended/page.tsx` when a
// signed-in owner's business data comes back missing or in an unrecognized
// status. No `onRetry` — outside a Next.js error boundary there is no
// `reset()` to wire up, so "Try Again" falls back to a full page reload.
export default function ErrorPage() {
  return <ErrorState />;
}
