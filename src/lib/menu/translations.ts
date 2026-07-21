import type { MenuCategory, Translations } from "./types";

// Item names are never translated (dish names are often local/proper nouns
// that don't translate well) — only item descriptions and category names
// have a translation cache. See 20260721040000_drop_item_translations_name.sql.
export function applyTranslations(
  categories: MenuCategory[],
  translations: Translations
): MenuCategory[] {
  return categories.map((category) => ({
    ...category,
    name: translations.categoryNames[category.id] ?? category.name,
    items: category.items.map((item) => ({
      ...item,
      description: translations.itemDescriptions[item.id] ?? item.description,
    })),
  }));
}
