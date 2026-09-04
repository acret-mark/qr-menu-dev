import type { Metadata } from "next";
import { ConfirmEmailScreen } from "@/components/auth/confirm-email-screen";

// Auth pages are functional-only and never meant to surface in search
// results (specs/033 FR-009).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <ConfirmEmailScreen email={email ?? null} />;
}
