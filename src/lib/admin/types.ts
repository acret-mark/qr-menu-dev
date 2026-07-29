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
