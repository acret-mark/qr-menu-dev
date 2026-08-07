export type PlanType = "standard" | "pro";
export type SubscriptionStatus = "pending" | "active" | "expired" | "cancelled";

// SRS §4.9 pricing — no pricing-admin feature exists in this MVP, so this is a
// plain constant rather than a database value (research.md §5).
export const PLAN_PRICES: Record<PlanType, number> = {
  standard: 299,
  pro: 399,
};

export interface LatestSubscription {
  id: string;
  plan: PlanType;
  status: SubscriptionStatus;
  paymentMethod: string | null;
  createdAt: string;
}

export interface OwnerSubscriptionStatus {
  currentPlan: PlanType;
  latest: LatestSubscription | null;
}
