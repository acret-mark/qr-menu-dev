import type { SupabaseClient } from "@supabase/supabase-js";
import { getOwnerBusiness } from "@/lib/auth/login";
import { DISPLAY_LANGUAGES, type DisplayLanguage } from "@/lib/menu/types";
import { hashItemDescription } from "./hash";
import type {
  CategoryOption,
  ItemFormData,
  ItemFormItem,
  OwnerMenuCategory,
  OwnerMenuItem,
} from "./types";

export async function getMenuForOwner(
  supabase: SupabaseClient,
  ownerId: string
): Promise<{ categories: OwnerMenuCategory[]; items: OwnerMenuItem[] }> {
  const { data: business } = await supabase
    .from("businesses")
    .select("id, source_language")
    .eq("owner_id", ownerId)
    .maybeSingle();

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
      .select("id, category_id, name, price, description, is_sold_out, is_best_seller")
      .eq("business_id", business.id)
      .order("sort_order", { ascending: true }),
  ]);

  const categories: OwnerMenuCategory[] = (categoryRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
  }));

  const itemIds = (itemRows ?? []).map((row) => row.id);

  const { data: translationRows } = itemIds.length
    ? await supabase.from("item_translations").select("item_id, language_code, source_hash").in(
        "item_id",
        itemIds
      )
    : { data: [] };

  const translationsByItem = new Map<string, Map<DisplayLanguage, string>>();
  for (const row of translationRows ?? []) {
    if (!translationsByItem.has(row.item_id)) {
      translationsByItem.set(row.item_id, new Map());
    }
    translationsByItem.get(row.item_id)!.set(row.language_code, row.source_hash);
  }

  const requiredLanguages = DISPLAY_LANGUAGES.filter((lang) => lang !== business.source_language);

  const items: OwnerMenuItem[] = (itemRows ?? []).map((row) => {
    const description = (row.description ?? "").trim();
    let hasStaleTranslation = false;

    if (description) {
      const currentHash = hashItemDescription(description);
      const existingForItem = translationsByItem.get(row.id);
      hasStaleTranslation = requiredLanguages.some(
        (lang) => existingForItem?.get(lang) !== currentHash
      );
    }

    return {
      id: row.id,
      categoryId: row.category_id,
      name: row.name,
      price: Number(row.price),
      isSoldOut: row.is_sold_out,
      isBestSeller: row.is_best_seller,
      hasStaleTranslation,
    };
  });

  return { categories, items };
}

export async function getItemFormData(
  supabase: SupabaseClient,
  ownerId: string,
  itemId?: string
): Promise<ItemFormData> {
  const business = await getOwnerBusiness(supabase, ownerId);

  if (!business) {
    return { categories: [], item: null };
  }

  const { data: categoryRows } = await supabase
    .from("categories")
    .select("id, name")
    .eq("business_id", business.id)
    .order("sort_order", { ascending: true });

  const categories: CategoryOption[] = (categoryRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
  }));

  if (!itemId) {
    return { categories, item: null };
  }

  const { data: itemRow } = await supabase
    .from("items")
    .select(
      "id, name, category_id, price, description, photo_url, is_displayed, is_sold_out, is_best_seller, description_source, ai_keywords"
    )
    .eq("id", itemId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!itemRow) {
    return { categories, item: null };
  }

  const item: ItemFormItem = {
    id: itemRow.id,
    name: itemRow.name,
    categoryId: itemRow.category_id,
    price: Number(itemRow.price),
    description: itemRow.description ?? "",
    photoUrl: itemRow.photo_url,
    isDisplayed: itemRow.is_displayed,
    isSoldOut: itemRow.is_sold_out,
    isBestSeller: itemRow.is_best_seller,
    descriptionSource: itemRow.description_source,
    aiKeywords: itemRow.ai_keywords,
  };

  return { categories, item };
}
