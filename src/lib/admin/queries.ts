import { createClient } from "@/lib/supabase/server";
import type {
  AdminBusinessDetail,
  AdminBusinessSummary,
  AdminMenuCategory,
  AdminSubscriptionRecord,
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
