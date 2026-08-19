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

  return (
    <OwnerShell status={business.status} businessName={business.name}>
      {children}
    </OwnerShell>
  );
}
