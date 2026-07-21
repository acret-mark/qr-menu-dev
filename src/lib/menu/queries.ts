import { createClient } from "@/lib/supabase/server";
import type { Business, ItemDetail, MenuCategory, MenuItem, Translations, DisplayLanguage } from "./types";

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, slug, logo_url, plan, source_language")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    logoUrl: data.logo_url,
    plan: data.plan,
    sourceLanguage: data.source_language,
  };
}

export async function getMenuData(businessId: string): Promise<MenuCategory[]> {
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
        .select(
          "id, category_id, name, description, price, photo_url, is_sold_out, is_best_seller, sort_order"
        )
        .eq("business_id", businessId)
        .eq("is_displayed", true)
        .order("is_best_seller", { ascending: false })
        .order("sort_order", { ascending: true }),
    ]);

  if (categoriesError) throw categoriesError;
  if (itemsError) throw itemsError;

  const itemsByCategory = new Map<string, MenuItem[]>();
  for (const item of items ?? []) {
    const list = itemsByCategory.get(item.category_id) ?? [];
    list.push({
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      photoUrl: item.photo_url,
      isSoldOut: item.is_sold_out,
      isBestSeller: item.is_best_seller,
    });
    itemsByCategory.set(item.category_id, list);
  }

  return (categories ?? [])
    .map((category) => ({
      id: category.id,
      name: category.name,
      items: itemsByCategory.get(category.id) ?? [],
    }))
    .filter((category) => category.items.length > 0);
}

export async function getTranslations(
  businessId: string,
  language: DisplayLanguage
): Promise<Translations> {
  const supabase = await createClient();

  const [{ data: categoryRows, error: categoryError }, { data: itemRows, error: itemError }] =
    await Promise.all([
      supabase
        .from("category_translations")
        .select("category_id, translated_name")
        .eq("business_id", businessId)
        .eq("language_code", language),
      supabase
        .from("item_translations")
        .select("item_id, translated_description")
        .eq("business_id", businessId)
        .eq("language_code", language),
    ]);

  if (categoryError) throw categoryError;
  if (itemError) throw itemError;

  const categoryNames: Record<string, string> = {};
  for (const row of categoryRows ?? []) {
    if (row.translated_name) categoryNames[row.category_id] = row.translated_name;
  }

  const itemDescriptions: Record<string, string> = {};
  for (const row of itemRows ?? []) {
    if (row.translated_description) itemDescriptions[row.item_id] = row.translated_description;
  }

  return { categoryNames, itemDescriptions };
}

export async function getItemDetail(
  businessId: string,
  itemId: string
): Promise<ItemDetail | null> {
  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("id, category_id, name, description, price, photo_url, is_sold_out, is_best_seller")
    .eq("business_id", businessId)
    .eq("id", itemId)
    .eq("is_displayed", true)
    .maybeSingle();

  if (itemError) throw itemError;
  if (!item) return null;

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, name")
    .eq("business_id", businessId)
    .eq("id", item.category_id)
    .maybeSingle();

  if (categoryError) throw categoryError;
  if (!category) return null;

  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    photoUrl: item.photo_url,
    isSoldOut: item.is_sold_out,
    isBestSeller: item.is_best_seller,
    categoryId: category.id,
    categoryName: category.name,
  };
}
