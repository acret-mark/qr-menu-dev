import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { menuCacheTag } from "./cache";
import { getInitialDisplayLanguage } from "./language";
import { applyTranslations } from "./translations";
import type { Business, MenuCategory, MenuItem, Translations, DisplayLanguage } from "./types";

const CACHE_REVALIDATE_SECONDS = 5;

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, slug, logo_url, address, plan, source_language")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        logoUrl: data.logo_url,
        address: data.address,
        plan: data.plan,
        sourceLanguage: data.source_language,
      };
    },
    ["business-by-slug", slug],
    { tags: [menuCacheTag(slug)], revalidate: CACHE_REVALIDATE_SECONDS }
  )();
}

export async function getMenuData(businessId: string, slug: string): Promise<MenuCategory[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();

      const [
        { data: categories, error: categoriesError },
        { data: items, error: itemsError },
        { data: itemIngredientRows, error: itemIngredientsError },
        { data: itemCategoryRows, error: itemCategoriesError },
      ] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name, sort_order")
          .eq("business_id", businessId)
          .order("sort_order", { ascending: true }),
        supabase
          .from("items")
          .select("id, name, description, price, photo_url, is_sold_out, is_best_seller")
          .eq("business_id", businessId)
          .eq("is_displayed", true),
        // Attach order, per FR-011 (030-menu-item-ingredients) — this query is
        // ordered so the grouping below preserves it without re-sorting.
        supabase
          .from("item_ingredients")
          .select("item_id, created_at, ingredients (id, name)")
          .eq("business_id", businessId)
          .order("created_at", { ascending: true }),
        // Per-category position (FR-005, 035-item-multiple-categories) — this
        // query is ordered so the fan-out below preserves each category's own
        // item order without re-sorting.
        supabase
          .from("item_categories")
          .select("item_id, category_id, sort_order, categories (name)")
          .eq("business_id", businessId)
          .order("sort_order", { ascending: true }),
      ]);

      if (categoriesError) throw categoriesError;
      if (itemsError) throw itemsError;
      // Deliberately NOT thrown, unlike categories/items above: item_ingredients
      // is a new table (schema-change-request.md) that may not exist yet in a
      // given environment. The public menu must keep rendering (Principle VI)
      // with simply no ingredients shown rather than erroring the whole page
      // for every business until that migration lands.
      if (itemIngredientsError) console.error("getMenuData: item_ingredients query failed", itemIngredientsError);
      if (itemCategoriesError) throw itemCategoriesError;

      const ingredientsByItem = new Map<string, { id: string; name: string }[]>();
      for (const row of itemIngredientRows ?? []) {
        const ingredient = row.ingredients as unknown as { id: string; name: string } | null;
        if (!ingredient) continue;
        const list = ingredientsByItem.get(row.item_id) ?? [];
        list.push(ingredient);
        ingredientsByItem.set(row.item_id, list);
      }

      const categoryNamesByItem = new Map<string, string[]>();
      for (const row of itemCategoryRows ?? []) {
        const categoryName = (row.categories as unknown as { name: string } | null)?.name;
        if (!categoryName) continue;
        const names = categoryNamesByItem.get(row.item_id) ?? [];
        names.push(categoryName);
        categoryNamesByItem.set(row.item_id, names);
      }

      const menuItemsById = new Map<string, MenuItem>();
      for (const item of items ?? []) {
        menuItemsById.set(item.id, {
          id: item.id,
          name: item.name,
          description: item.description,
          price: Number(item.price),
          photoUrl: item.photo_url,
          isSoldOut: item.is_sold_out,
          isBestSeller: item.is_best_seller,
          ingredients: ingredientsByItem.get(item.id) ?? [],
          categoryNames: categoryNamesByItem.get(item.id) ?? [],
        });
      }

      // Fan each item into EVERY category it's assigned to
      // (035-item-multiple-categories FR-001/FR-003), not just one, in
      // item_categories.sort_order order (FR-005) — a displayed item whose
      // business row was excluded above (is_displayed false) simply has no
      // entry in menuItemsById and is skipped here.
      const itemsByCategory = new Map<string, MenuItem[]>();
      for (const row of itemCategoryRows ?? []) {
        const menuItem = menuItemsById.get(row.item_id);
        if (!menuItem) continue;
        const list = itemsByCategory.get(row.category_id) ?? [];
        list.push(menuItem);
        itemsByCategory.set(row.category_id, list);
      }

      // Pin best sellers to the top of each category's own list (FR-008),
      // via a stable sort — items tied on is_best_seller keep the
      // sort_order-derived order the loop above already put them in.
      for (const list of itemsByCategory.values()) {
        list.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller));
      }

      return (categories ?? [])
        .map((category) => ({
          id: category.id,
          name: category.name,
          items: itemsByCategory.get(category.id) ?? [],
        }))
        .filter((category) => category.items.length > 0);
    },
    ["menu-data", businessId],
    { tags: [menuCacheTag(slug)], revalidate: CACHE_REVALIDATE_SECONDS }
  )();
}

export async function getTranslations(
  businessId: string,
  language: DisplayLanguage,
  slug: string
): Promise<Translations> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();

      const [
        { data: categoryRows, error: categoryError },
        { data: itemRows, error: itemError },
        { data: ingredientRows, error: ingredientError },
      ] = await Promise.all([
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
        supabase
          .from("ingredient_translations")
          .select("ingredient_id, translated_name")
          .eq("business_id", businessId)
          .eq("language_code", language),
      ]);

      if (categoryError) throw categoryError;
      if (itemError) throw itemError;
      if (ingredientError) throw ingredientError;

      const categoryNames: Record<string, string> = {};
      for (const row of categoryRows ?? []) {
        if (row.translated_name) categoryNames[row.category_id] = row.translated_name;
      }

      const itemDescriptions: Record<string, string> = {};
      for (const row of itemRows ?? []) {
        if (row.translated_description) itemDescriptions[row.item_id] = row.translated_description;
      }

      const ingredientNames: Record<string, string> = {};
      for (const row of ingredientRows ?? []) {
        if (row.translated_name) ingredientNames[row.ingredient_id] = row.translated_name;
      }

      return { categoryNames, itemDescriptions, ingredientNames };
    },
    ["menu-translations", businessId, language],
    { tags: [menuCacheTag(slug)], revalidate: CACHE_REVALIDATE_SECONDS }
  )();
}

export async function loadDisplayCategories(business: Business): Promise<{
  sourceCategories: MenuCategory[];
  initialLanguage: DisplayLanguage;
  initialCategories: MenuCategory[];
  needsClientProbe: boolean;
}> {
  const sourceCategories = await getMenuData(business.id, business.slug);

  let initialLanguage: DisplayLanguage = "en";
  let initialCategories = sourceCategories;
  let needsClientProbe = false;

  if (business.plan === "pro") {
    const resolved = await getInitialDisplayLanguage(business.sourceLanguage);
    initialLanguage = resolved.language;
    needsClientProbe = resolved.needsClientProbe;
    if (!resolved.skipTranslation && initialLanguage !== business.sourceLanguage) {
      const translations = await getTranslations(business.id, initialLanguage, business.slug);
      initialCategories = applyTranslations(sourceCategories, translations);
    }
  }

  return { sourceCategories, initialLanguage, initialCategories, needsClientProbe };
}
