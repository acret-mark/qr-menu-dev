// businesses.plan — an owner's paid-tier choice. Deliberately does NOT
// include "trial": a business's own plan field represents pricing-tier
// selection, not its subscription-row plan, so "trial" must never appear in
// pricing UI driven by this type (research.md §5, specs/032 T001 note).
export type PlanType = "standard" | "pro";
export type SubscriptionStatus = "pending" | "active" | "expired" | "cancelled";

/**
 * subscriptions.plan — unlike PlanType above, this DOES include "trial"
 * (specs/032-unified-subscription-lifecycle T001:
 * 20260902000000_add_trial_plan_type.sql widened plan_type rather than
 * adding a new subscription_status value). Any code reading a subscription
 * row's plan directly (not businesses.plan) must use this type instead of
 * PlanType.
 */
export type SubscriptionPlanType = PlanType | "trial";

// SRS §4.9 pricing — no pricing-admin feature exists in this MVP, so this is a
// plain constant rather than a database value (research.md §5). No "trial"
// key: a trial subscription is intentionally priceless. Any new code reading
// a subscription's plan directly (SubscriptionPlanType) must defensively skip
// this lookup for "trial" rather than index into it.
export const PLAN_PRICES: Record<PlanType, number> = {
  standard: 299,
  pro: 399,
};

export interface LatestSubscription {
  id: string;
  plan: SubscriptionPlanType;
  status: SubscriptionStatus;
  paymentMethod: string | null;
  createdAt: string;
}

export interface OwnerSubscriptionStatus {
  currentPlan: PlanType;
  latest: LatestSubscription | null;
  /** True when the business's own status is "trial" (admin-granted, no subscription row). */
  isTrial: boolean;
}
