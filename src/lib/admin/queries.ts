import { createClient } from "@/lib/supabase/server";
import type {
  AdminBusinessDetail,
  AdminBusinessSummary,
  AdminMenuCategory,
  AdminPendingPayment,
  AdminPendingPaymentDetail,
  AdminSubscriptionRecord,
  AdminSupportTicket,
  PlanType,
} from "./types";

export async function getBusinessList(): Promise<AdminBusinessSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, plan, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    plan: row.plan,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function getBusinessDetail(id: string): Promise<AdminBusinessDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, logo_url, contact_phone, contact_email, address, plan, status, created_at, trial_ends_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    logoUrl: data.logo_url,
    contactPhone: data.contact_phone,
    contactEmail: data.contact_email,
    address: data.address,
    plan: data.plan,
    status: data.status,
    createdAt: data.created_at,
    trialEndsAt: data.trial_ends_at,
  };
}

export async function getBusinessMenu(businessId: string): Promise<AdminMenuCategory[]> {
  const supabase = await createClient();

  const [{ data: categories, error: categoriesError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, name, sort_order")
        .eq("business_id", businessId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("items")
        .select("id, category_id, name, price, is_sold_out, is_displayed, sort_order")
        .eq("business_id", businessId)
        .order("sort_order", { ascending: true }),
    ]);

  if (categoriesError) throw categoriesError;
  if (itemsError) throw itemsError;

  const itemsByCategory = new Map<string, AdminMenuCategory["items"]>();
  for (const item of items ?? []) {
    const list = itemsByCategory.get(item.category_id) ?? [];
    list.push({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      isSoldOut: item.is_sold_out,
      isDisplayed: item.is_displayed,
    });
    itemsByCategory.set(item.category_id, list);
  }

  return (categories ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    items: itemsByCategory.get(category.id) ?? [],
  }));
}

export async function getBusinessSubscriptions(
  businessId: string
): Promise<AdminSubscriptionRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("id, plan, amount, status, payment_method, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    plan: row.plan,
    amount: Number(row.amount),
    status: row.status,
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
  }));
}

/**
 * Every subscription awaiting payment verification, across all businesses, for
 * the Payment Queue (A-04).
 *
 * Ordered OLDEST-FIRST — this is a work queue, so the owner who has waited
 * longest sits at the top. That is deliberately the opposite of
 * getBusinessSubscriptions() above, which is reverse-chronological history for
 * A-03. Do not "align" the two.
 *
 * `businesses!inner` keeps the join RLS-filtered: a row whose business isn't
 * readable is dropped rather than rendered with a blank name.
 */
/**
 * Shape of one joined row. Declared locally because this project has no
 * generated Supabase types: without them, supabase-js infers the `businesses`
 * embed as an array, while PostgREST actually returns a single object for a
 * to-one relationship (subscriptions.business_id → businesses.id). Both are
 * modelled here so the normalisation below is honest rather than a blind cast.
 */
type PendingPaymentRow = {
  id: string;
  business_id: string;
  plan: PlanType;
  amount: string | number;
  payment_method: string | null;
  payment_proof_url: string | null;
  created_at: string;
  businesses: { name: string } | { name: string }[] | null;
};

export async function getPendingPayments(): Promise<AdminPendingPayment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "id, business_id, plan, amount, payment_method, payment_proof_url, created_at, businesses!inner(name)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as unknown as PendingPaymentRow[]).map((row) => {
    const business = Array.isArray(row.businesses) ? row.businesses[0] : row.businesses;

    return {
      id: row.id,
      businessId: row.business_id,
      businessName: business?.name ?? "(unknown business)",
      plan: row.plan,
      amount: Number(row.amount),
      paymentMethod: row.payment_method,
      paymentProofUrl: row.payment_proof_url,
      submittedAt: row.created_at,
    };
  });
}

/**
 * Row shape for a single subscription joined to its business, for Activate
 * Subscription (A-05). Unlike getPendingPayments() this is not filtered to
 * `status = 'pending'` — the page itself decides how to render an already-
 * resolved row (FR-008). `businesses!inner` is safe here (not just an
 * optimisation): `subscriptions.business_id` has `on delete cascade` to
 * `businesses.id`, so a subscription can never outlive its business.
 */
type PendingPaymentDetailRow = {
  id: string;
  business_id: string;
  plan: PlanType;
  amount: string | number;
  status: AdminPendingPaymentDetail["status"];
  payment_method: string | null;
  payment_proof_url: string | null;
  created_at: string;
  activated_by: string | null;
  activated_at: string | null;
  starts_at: string | null;
  expires_at: string | null;
  businesses:
    | { name: string; contact_email: string | null }
    | { name: string; contact_email: string | null }[];
};

export async function getPendingPaymentById(id: string): Promise<AdminPendingPaymentDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "id, business_id, plan, amount, status, payment_method, payment_proof_url, created_at, activated_by, activated_at, starts_at, expires_at, businesses!inner(name, contact_email)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as PendingPaymentDetailRow;
  const business = Array.isArray(row.businesses) ? row.businesses[0] : row.businesses;

  return {
    id: row.id,
    businessId: row.business_id,
    businessName: business.name,
    contactEmail: business.contact_email,
    plan: row.plan,
    amount: Number(row.amount),
    status: row.status,
    paymentMethod: row.payment_method,
    paymentProofUrl: row.payment_proof_url,
    submittedAt: row.created_at,
    activatedBy: row.activated_by,
    activatedAt: row.activated_at,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
  };
}

/**
 * Every support ticket, across all businesses, for the Support Tickets inbox
 * (A-06) — full subject/message/reply content in one query, since the screen
 * is a single-route split view (list + reading pane), not a list + [id] pair.
 *
 * Ordered NEWEST-FIRST — a triage inbox, not a FIFO work queue like
 * getPendingPayments() above; see research.md §4. Filtering/sorting in the UI
 * happens client-side against this full set (pilot-scale ticket volume).
 *
 * `businesses!inner` keeps the join RLS-filtered: a ticket whose business
 * isn't readable is dropped rather than rendered with a blank name, matching
 * getPendingPayments()'s convention.
 */
type SupportTicketRow = {
  id: string;
  business_id: string;
  subject: string;
  message: string;
  status: AdminSupportTicket["status"];
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  businesses:
    | { name: string; contact_email: string | null }
    | { name: string; contact_email: string | null }[]
    | null;
};

export async function getSupportTickets(): Promise<AdminSupportTicket[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .select(
      "id, business_id, subject, message, status, admin_reply, replied_at, created_at, businesses!inner(name, contact_email)"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as SupportTicketRow[]).map((row) => {
    const business = Array.isArray(row.businesses) ? row.businesses[0] : row.businesses;

    return {
      id: row.id,
      businessId: row.business_id,
      businessName: business?.name ?? "(unknown business)",
      businessEmail: business?.contact_email ?? null,
      subject: row.subject,
      message: row.message,
      status: row.status,
      adminReply: row.admin_reply,
      repliedAt: row.replied_at,
      createdAt: row.created_at,
    };
  });
}

export async function hasOpenSupportTicket(businessId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .select("id")
    .eq("business_id", businessId)
    .in("status", ["open", "in_progress"])
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}
