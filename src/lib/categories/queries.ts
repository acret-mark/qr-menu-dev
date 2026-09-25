import type { SupabaseClient } from "@supabase/supabase-js";
import { DISPLAY_LANGUAGES, type DisplayLanguage } from "@/lib/menu/types";
import { hashCategoryName } from "./hash";
import type { OwnerCategory } from "./types";

export async function getCategoriesForOwner(
  supabase: SupabaseClient,
  ownerId: string
): Promise<OwnerCategory[]> {
  const { data: business, error } = await supabase
    .from("businesses")
    .select("id, source_language")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error || !business) {
    return [];
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, sort_order")
    .eq("business_id", business.id)
    .order("sort_order", { ascending: true });

  if (!categories || categories.length === 0) {
    return [];
  }

  const requiredLanguages = DISPLAY_LANGUAGES.filter((lang) => lang !== business.source_language);
  const categoryIds = categories.map((category) => category.id);

  const [{ data: linkRows }, { data: translationRows }] = await Promise.all([
    // Every item_categories row for this business's categories — used below
    // to compute both the display total (itemCount) and the "would actually
    // be deleted" count (FR-007, deletableItemCount: items with no OTHER
    // category link), one query instead of one count query per category.
    supabase.from("item_categories").select("item_id, category_id").in("category_id", categoryIds),
    supabase
      .from("category_translations")
      .select("category_id, language_code, source_hash")
      .in("category_id", categoryIds),
  ]);

  const categoryIdsByItem = new Map<string, Set<string>>();
  for (const row of linkRows ?? []) {
    const set = categoryIdsByItem.get(row.item_id) ?? new Set<string>();
    set.add(row.category_id);
    categoryIdsByItem.set(row.item_id, set);
  }

  const itemCountByCategory = new Map<string, number>();
  const deletableCountByCategory = new Map<string, number>();
  for (const row of linkRows ?? []) {
    itemCountByCategory.set(row.category_id, (itemCountByCategory.get(row.category_id) ?? 0) + 1);

    const linkedCategories = categoryIdsByItem.get(row.item_id);
    if (linkedCategories && linkedCategories.size === 1) {
      deletableCountByCategory.set(
        row.category_id,
        (deletableCountByCategory.get(row.category_id) ?? 0) + 1
      );
    }
  }

  const translationsByCategory = new Map<string, Map<DisplayLanguage, string>>();
  for (const row of translationRows ?? []) {
    if (!translationsByCategory.has(row.category_id)) {
      translationsByCategory.set(row.category_id, new Map());
    }
    translationsByCategory.get(row.category_id)!.set(row.language_code, row.source_hash);
  }

  return categories.map((category) => {
    const currentHash = hashCategoryName(category.name);
    const existingForCategory = translationsByCategory.get(category.id);
    const hasStaleTranslation = requiredLanguages.some(
      (lang) => existingForCategory?.get(lang) !== currentHash
    );

    return {
      id: category.id,
      name: category.name,
      sortOrder: category.sort_order,
      itemCount: itemCountByCategory.get(category.id) ?? 0,
      deletableItemCount: deletableCountByCategory.get(category.id) ?? 0,
      hasStaleTranslation,
    };
  });
}
