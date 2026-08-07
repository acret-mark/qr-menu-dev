import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  DASHBOARD_PATH,
  ERROR_PATH,
  LOGIN_PATH,
  getOwnerBusiness,
  isKnownBusinessStatus,
} from "@/lib/auth/login";
import { buttonVariants } from "@/components/ui/button";
import { signOutOwner } from "@/lib/auth/logout";

// Top-level route, deliberately outside the `(owner)` route group: that layout
// is what redirects *to* this page when `status === 'suspended'`, so this page
// re-resolves status itself rather than trusting how it was reached (a
// suspended owner bookmarking this URL, or being reactivated mid-session and
// revisiting it directly, must still get the correct outcome).
export default async function AccountSuspendedPage() {
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

  if (business.status !== "suspended") {
    redirect(DASHBOARD_PATH);
  }

  // No OwnerShell/OwnerTabBar here on purpose (FR-002) — this is a full
  // blocking gate, not a navigable dashboard screen, so a suspended owner has
  // no route back into Menu/Categories/QR from it.
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning/10 text-warning-foreground">
          <Lock size={24} />
        </div>
        <h1 className="mt-4 font-heading text-2xl font-semibold">Your account is on hold</h1>
        <p className="mt-2 max-w-[32ch] text-sm text-muted-foreground">
          Your subscription needs attention — either your trial has ended or your last payment
          couldn&apos;t be verified. Reactivate to keep your menu live and editable.
        </p>

        {/*
          Both links below point at the business-profile page itself, not a
          "#subscription"/"#support" hash — that page has no tab shell yet
          (021-owner-subscription-tab's SubscriptionPanel isn't mounted there,
          and the owner Support screen isn't built at all). A plain link to
          the real, existing page is honest today and needs no change once
          that wiring ships (research.md §3).
        */}
        <Link
          href="/business-profile"
          className={buttonVariants({ size: "lg", className: "mt-8 h-11 w-full" })}
        >
          Reactivate Subscription
        </Link>
        <Link
          href="/business-profile"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "mt-2 h-11 w-full",
          })}
        >
          Contact Support
        </Link>

        <form action={signOutOwner} className="mt-5">
          <button
            type="submit"
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
