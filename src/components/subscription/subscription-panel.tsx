import { createClient } from "@/lib/supabase/server";
import { getSubscriptionStatusForOwner } from "@/lib/subscription/queries";
import { SubscriptionSubmitForm } from "@/components/subscription/subscription-submit-form";
import { PLAN_PRICES } from "@/lib/subscription/types";

const PLAN_LABELS = { standard: "Standard", pro: "Pro" } as const;

const STATUS_LABELS = {
  active: "Active",
  pending: "Pending verification",
  expired: "Expired",
  cancelled: "Cancelled",
} as const;

export async function SubscriptionPanel() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Every owner route already guarantees a signed-in user with a valid
  // business row before any panel content renders.
  const status = await getSubscriptionStatusForOwner(supabase, user!.id);

  if (!status) {
    return null;
  }

  const { currentPlan, latest, isTrial } = status;

  return (
    <div className="flex flex-col gap-4">
      <div className="mx-4 rounded-lg border border-border bg-muted p-5">
        <div className="flex items-baseline justify-between">
          <span className="font-heading text-lg font-semibold">{PLAN_LABELS[currentPlan]}</span>
          <span className="text-sm font-medium">
            {latest ? STATUS_LABELS[latest.status] : isTrial ? "Trial" : "No subscription yet"}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          ₱{PLAN_PRICES[currentPlan]} / month
        </p>
        {latest?.expiresAt && (
          <div className="mt-3 flex justify-between border-t border-dashed border-border pt-3 text-sm text-muted-foreground">
            <span>{isTrial ? "Trial ends" : "Renews / expires"}</span>
            <span className="font-medium text-foreground">
              {new Date(latest.expiresAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        )}
        {latest?.paymentMethod && (
          <div className="mt-3 flex justify-between border-t border-dashed border-border pt-3 text-sm text-muted-foreground">
            <span>Payment method</span>
            <span className="font-medium text-foreground">
              {latest.paymentMethod === "gcash" ? "GCash" : "Bank Transfer"}
            </span>
          </div>
        )}
      </div>

      {/*
       * Always shown, regardless of `latest.status` (specs/032-unified-
       * subscription-lifecycle). A healthy trial/paid subscription sits at
       * status "active" for its entire life, right up until the expiry cron
       * flips it to "expired" — which only happens once the grace period has
       * already elapsed, i.e. after the owner is already locked out. Gating
       * this block on status !== "active" (the old, pre-032 behavior) meant
       * the T-7/T-1/T-0 reminder emails told owners to "submit your renewal
       * payment" / "upgrade" here, but the form wasn't actually rendered
       * until it was too late to matter. Submitting early while still
       * "active" is harmless — worst case is a redundant pending row an
       * admin reviews.
       */}
      <div className="mx-4 rounded-lg border border-border p-4 text-sm">
        <p className="font-medium">Manual payment instructions</p>
        <p className="mt-2 text-muted-foreground">
          GCash: 0917-123-4567 (Hapag Inc.)
          <br />
          Bank Transfer: BDO Savings — 1234-5678-90 (Hapag Inc.)
        </p>
        <p className="mt-2 text-muted-foreground">
          After paying, choose your method and upload proof below.
        </p>
      </div>

      <SubscriptionSubmitForm currentPlan={currentPlan} />
    </div>
  );
}
