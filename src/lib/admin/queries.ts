import { createClient } from "@/lib/supabase/server";
import type {
  AdminBusinessDetail,
  AdminBusinessSummary,
  AdminMenuCategory,
  AdminPendingPayment,
  AdminSubscriptionRecord,
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
    .select("id, name, slug, logo_url, contact_phone, contact_email, address, plan, status, created_at")
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
