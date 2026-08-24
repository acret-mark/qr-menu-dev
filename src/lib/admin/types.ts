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
  /**
   * Admin-set reference date recorded when a trial is granted without a
   * payment proof (specs/029-admin-trial-activation). Informational only —
   * no code reads or acts on it automatically.
   */
  trialEndsAt: string | null;
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

/**
 * The single-subscription detail view for Activate Subscription (A-05).
 * Deliberately its own shape rather than an extension of AdminPendingPayment:
 * this screen must render a subscription that is NOT pending (already
 * active/expired/cancelled, per FR-008), so `status` and the activation
 * fields are load-bearing here, not noise.
 */
export interface AdminPendingPaymentDetail {
  id: string;
  businessId: string;
  businessName: string;
  contactEmail: string | null;
  plan: PlanType;
  amount: number;
  status: SubscriptionStatus;
  paymentMethod: string | null;
  paymentProofUrl: string | null;
  submittedAt: string;
  activatedBy: string | null;
  activatedAt: string | null;
  startsAt: string | null;
  expiresAt: string | null;
}

export type TicketStatus = "open" | "in_progress" | "resolved";

/**
 * A support ticket for the Support Tickets inbox (A-06). One shape serves both
 * the list row and the reading-pane detail — the screen is a single-route
 * split view (list + reading pane), not a list-route + [id]-route pair, so
 * there is no separate "detail" type. `adminReply`/`repliedAt` are null until
 * an admin replies, and are overwritten in place on a second reply — the
 * schema holds exactly one reply per ticket, never a thread.
 */
export interface AdminSupportTicket {
  id: string;
  businessId: string;
  businessName: string;
  businessEmail: string | null;
  subject: string;
  message: string;
  status: TicketStatus;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
}
