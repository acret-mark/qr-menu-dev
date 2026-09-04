import type { Metadata } from "next";
import { ErrorState } from "@/components/system/error-state";

// Error pages are functional-only and never meant to surface in search
// results (specs/033 FR-009).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// The destination `ERROR_PATH` ("/error", src/lib/auth/login.ts) already
// points to from `(owner)/layout.tsx` and `account-suspended/page.tsx` when a
// signed-in owner's business data comes back missing or in an unrecognized
// status. No `onRetry` — outside a Next.js error boundary there is no
// `reset()` to wire up, so "Try Again" falls back to a full page reload.
export default function ErrorPage() {
  return <ErrorState />;
}
