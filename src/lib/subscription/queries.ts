import type { SupabaseClient } from "@supabase/supabase-js";
import type { OwnerSubscriptionStatus } from "./types";

export async function getSubscriptionStatusForOwner(
  supabase: SupabaseClient,
  ownerId: string
): Promise<OwnerSubscriptionStatus | null> {
  const { data: business, error } = await supabase
    .from("businesses")
    .select("id, plan, status")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error || !business) {
    return null;
  }

  const { data: latestRow } = await supabase
    .from("subscriptions")
    .select("id, plan, status, payment_method, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    currentPlan: business.plan,
    latest: latestRow
      ? {
          id: latestRow.id,
          plan: latestRow.plan,
          status: latestRow.status,
          paymentMethod: latestRow.payment_method,
          createdAt: latestRow.created_at,
        }
      : null,
    isTrial: business.status === "trial",
  };
}
