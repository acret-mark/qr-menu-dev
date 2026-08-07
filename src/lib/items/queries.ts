import type { SupabaseClient } from "@supabase/supabase-js";
import { getOwnerBusiness } from "@/lib/auth/login";
import type { OwnerMenuCategory, OwnerMenuItem } from "./types";

export async function getMenuForOwner(
  supabase: SupabaseClient,
  ownerId: string
): Promise<{ categories: OwnerMenuCategory[]; items: OwnerMenuItem[] }> {
  const business = await getOwnerBusiness(supabase, ownerId);

  if (!business) {
    return { categories: [], items: [] };
  }

  const [{ data: categoryRows }, { data: itemRows }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, sort_order")
      .eq("business_id", business.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("items")
      .select("id, category_id, name, price, is_sold_out, is_best_seller")
      .eq("business_id", business.id)
      .order("sort_order", { ascending: true }),
  ]);

  const categories: OwnerMenuCategory[] = (categoryRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
  }));

  const items: OwnerMenuItem[] = (itemRows ?? []).map((row) => ({
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    price: Number(row.price),
    isSoldOut: row.is_sold_out,
    isBestSeller: row.is_best_seller,
  }));

  return { categories, items };
}
