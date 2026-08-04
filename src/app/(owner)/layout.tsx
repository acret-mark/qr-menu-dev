import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ERROR_PATH,
  LOGIN_PATH,
  SUSPENDED_PATH,
  getOwnerBusiness,
  isKnownBusinessStatus,
} from "@/lib/auth/login";
import { StatusBanner } from "@/components/dashboard/status-banner";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

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
    <div className="min-h-dvh bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {(business.status === "pending" || business.status === "trial") && (
          <StatusBanner status={business.status} />
        )}
        {children}
      </div>
    </div>
  );
}
