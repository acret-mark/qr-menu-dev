export type BusinessStatus = "active" | "trial" | "pending" | "suspended";
export type PlanType = "standard" | "pro";

export interface AdminBusinessSummary {
  id: string;
  name: string;
  plan: PlanType;
  status: BusinessStatus;
  createdAt: string;
}

export interface AdminBusinessDetail {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
  plan: PlanType;
  status: BusinessStatus;
  createdAt: string;
}

export interface AdminMenuItem {
  id: string;
  name: string;
  price: number;
  isSoldOut: boolean;
  isDisplayed: boolean;
}

export interface AdminMenuCategory {
  id: string;
  name: string;
  items: AdminMenuItem[];
}

export type SubscriptionStatus = "pending" | "active" | "expired" | "cancelled";

export interface AdminSubscriptionRecord {
  id: string;
  plan: PlanType;
  amount: number;
  status: SubscriptionStatus;
  paymentMethod: string | null;
  createdAt: string;
}

/**
 * A subscription awaiting payment verification, as shown on the Payment Queue
 * (A-04). Deliberately separate from AdminSubscriptionRecord: every row here is
 * `pending`, so a status field would be noise, and the queue needs the business
 * name and proof URL that the history shape doesn't carry.
 */
export interface AdminPendingPayment {
  id: string;
  businessId: string;
  businessName: string;
  plan: PlanType;
  amount: number;
  paymentMethod: string | null;
  paymentProofUrl: string | null;
  submittedAt: string;
}
