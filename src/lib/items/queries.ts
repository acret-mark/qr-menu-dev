import type { SupabaseClient } from "@supabase/supabase-js";
import { getOwnerBusiness } from "@/lib/auth/login";
import { DISPLAY_LANGUAGES, type DisplayLanguage, type PlanType } from "@/lib/menu/types";
import { hashItemDescription } from "./hash";
import type {
  CategoryOption,
  IngredientOption,
  ItemFormData,
  ItemFormItem,
  OwnerMenuCategory,
  OwnerMenuItem,
} from "./types";

export async function getMenuForOwner(
  supabase: SupabaseClient,
  ownerId: string
): Promise<{ plan: PlanType | null; categories: OwnerMenuCategory[]; items: OwnerMenuItem[] }> {
  const { data: business } = await supabase
    .from("businesses")
    .select("id, source_language, plan")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (!business) {
    return { plan: null, categories: [], items: [] };
  }

  const [{ data: categoryRows }, { data: itemRows }, { data: itemCategoryRows }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, sort_order")
      .eq("business_id", business.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("items")
      .select("id, name, price, description, photo_url, is_sold_out, is_best_seller")
      .eq("business_id", business.id),
    // Per-category position (FR-005, 035-item-multiple-categories) — ordered
    // so grouping below preserves each category's own item order without
    // re-sorting.
    supabase
      .from("item_categories")
      .select("item_id, category_id, sort_order")
      .eq("business_id", business.id)
      .order("sort_order", { ascending: true }),
  ]);

  const categories: OwnerMenuCategory[] = (categoryRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
  }));

  const categoryIdsByItem = new Map<string, string[]>();
  const categorySortOrdersByItem = new Map<string, Record<string, number>>();
  for (const row of itemCategoryRows ?? []) {
    const list = categoryIdsByItem.get(row.item_id) ?? [];
    list.push(row.category_id);
    categoryIdsByItem.set(row.item_id, list);

    const sortOrders = categorySortOrdersByItem.get(row.item_id) ?? {};
    sortOrders[row.category_id] = row.sort_order;
    categorySortOrdersByItem.set(row.item_id, sortOrders);
  }

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
      categoryIds: categoryIdsByItem.get(row.id) ?? [],
      categorySortOrders: categorySortOrdersByItem.get(row.id) ?? {},
      name: row.name,
      price: Number(row.price),
      photoUrl: row.photo_url,
      isSoldOut: row.is_sold_out,
      isBestSeller: row.is_best_seller,
      hasStaleTranslation,
    };
  });

  return { plan: business.plan, categories, items };
}

export async function getItemFormData(
  supabase: SupabaseClient,
  ownerId: string,
  itemId?: string
): Promise<ItemFormData> {
  const business = await getOwnerBusiness(supabase, ownerId);

  if (!business) {
    return { categories: [], businessIngredients: [], item: null };
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

  const { data: ingredientRows } = await supabase
    .from("ingredients")
    .select("id, name")
    .eq("business_id", business.id)
    .order("name", { ascending: true });

  const businessIngredients: IngredientOption[] = (ingredientRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
  }));

  if (!itemId) {
    return { categories, businessIngredients, item: null };
  }

  const { data: itemRow } = await supabase
    .from("items")
    .select(
      "id, name, price, description, photo_url, is_displayed, is_sold_out, is_best_seller, description_source, ai_keywords"
    )
    .eq("id", itemId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!itemRow) {
    return { categories, businessIngredients, item: null };
  }

  const { data: itemCategoryRows } = await supabase
    .from("item_categories")
    .select("category_id")
    .eq("item_id", itemRow.id)
    .order("sort_order", { ascending: true });

  const categoryIds = (itemCategoryRows ?? []).map((row) => row.category_id);

  const { data: itemIngredientRows } = await supabase
    .from("item_ingredients")
    .select("ingredient_id, created_at, ingredients (id, name)")
    .eq("item_id", itemRow.id)
    .order("created_at", { ascending: true });

  const ingredients: IngredientOption[] = (itemIngredientRows ?? [])
    .map((row) => row.ingredients as unknown as { id: string; name: string } | null)
    .filter((ingredient): ingredient is { id: string; name: string } => ingredient !== null)
    .map((ingredient) => ({ id: ingredient.id, name: ingredient.name }));

  const item: ItemFormItem = {
    id: itemRow.id,
    name: itemRow.name,
    categoryIds,
    price: Number(itemRow.price),
    description: itemRow.description ?? "",
    photoUrl: itemRow.photo_url,
    isDisplayed: itemRow.is_displayed,
    isSoldOut: itemRow.is_sold_out,
    isBestSeller: itemRow.is_best_seller,
    descriptionSource: itemRow.description_source,
    aiKeywords: itemRow.ai_keywords,
    ingredients,
  };

  return { categories, businessIngredients, item };
}
