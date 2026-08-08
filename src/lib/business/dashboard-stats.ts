import type { SupabaseClient } from "@supabase/supabase-js";

export type DashboardStats = {
  name: string;
  logoUrl: string | null;
  plan: "standard" | "pro";
  status: "pending" | "trial" | "active" | "suspended";
  categoryCount: number;
  itemCount: number;
};

export async function getDashboardStats(
  supabase: SupabaseClient,
  ownerId: string
): Promise<DashboardStats | null> {
  const { data: business, error } = await supabase
    .from("businesses")
    .select("id, name, logo_url, plan, status")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error || !business) {
    return null;
  }

  const [{ count: categoryCount }, { count: itemCount }] = await Promise.all([
    supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id),
    supabase
      .from("items")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id),
  ]);

  return {
    name: business.name,
    logoUrl: business.logo_url,
    plan: business.plan,
    status: business.status,
    categoryCount: categoryCount ?? 0,
    itemCount: itemCount ?? 0,
  };
}
