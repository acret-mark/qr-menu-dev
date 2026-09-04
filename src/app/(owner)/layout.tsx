import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import {
  ERROR_PATH,
  LOGIN_PATH,
  SUSPENDED_PATH,
  getOwnerBusiness,
  isKnownBusinessStatus,
} from "@/lib/auth/login";
import { OwnerShell } from "@/components/dashboard/owner-shell";
import { getSubscriptionAccess } from "@/lib/subscription/access-gate";

// Covers dashboard/menu/categories/qr/business-profile/support in one place —
// none of these pages are ever meant to appear in search results (specs/033
// FR-007).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await getCurrentUser();

  if (!user) {
    redirect(LOGIN_PATH);
  }

  const business = await getOwnerBusiness(supabase, user.id);

  if (!business || !isKnownBusinessStatus(business.status)) {
    redirect(ERROR_PATH);
  }

  if (business.status === "suspended") {
    redirect(SUSPENDED_PATH);
  }

  // Only meaningful for trial/active — a still-pending business has never
  // had lifecycle access to lose (spec FR-014 concerns the locked state
  // that follows an elapsed grace period, not first-activation waiting).
  const locked =
    business.status !== "pending" &&
    !(await getSubscriptionAccess(supabase, business.id)).full;

  return (
    <OwnerShell status={business.status} businessName={business.name} locked={locked}>
      {children}
    </OwnerShell>
  );
}
