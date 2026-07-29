export type BusinessStatus = "active" | "trial" | "pending" | "suspended";
export type PlanType = "standard" | "pro";

export interface AdminBusinessSummary {
  id: string;
  name: string;
  plan: PlanType;
  status: BusinessStatus;
  createdAt: string;
}
