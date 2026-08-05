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

  const [itemCounts, { data: translationRows }] = await Promise.all([
    Promise.all(
      categories.map((category) =>
        supabase
          .from("items")
          .select("id", { count: "exact", head: true })
          .eq("category_id", category.id)
      )
    ),
    supabase
      .from("category_translations")
      .select("category_id, language_code, source_hash")
      .in(
        "category_id",
        categories.map((category) => category.id)
      ),
  ]);

  const translationsByCategory = new Map<string, Map<DisplayLanguage, string>>();
  for (const row of translationRows ?? []) {
    if (!translationsByCategory.has(row.category_id)) {
      translationsByCategory.set(row.category_id, new Map());
    }
    translationsByCategory.get(row.category_id)!.set(row.language_code, row.source_hash);
  }

  return categories.map((category, index) => {
    const currentHash = hashCategoryName(category.name);
    const existingForCategory = translationsByCategory.get(category.id);
    const hasStaleTranslation = requiredLanguages.some(
      (lang) => existingForCategory?.get(lang) !== currentHash
    );

    return {
      id: category.id,
      name: category.name,
      sortOrder: category.sort_order,
      itemCount: itemCounts[index].count ?? 0,
      hasStaleTranslation,
    };
  });
}
