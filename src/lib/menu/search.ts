import type { MenuCategory, MenuItem } from "./types";

export interface SearchResult {
  item: MenuItem;
  categoryNames: string[];
}

// Case-insensitive substring match against item name and description — not
// exact-match, not word-boundary. Checks whichever MenuCategory[] is
// currently active (the caller passes translated categories for the
// current display language), so this naturally follows the Pro-plan
// language toggle without any language-specific branching here. Item name
// is never translated, so name matching is language-independent by
// construction — see translations.ts.
//
// Returns each match paired with every category it belongs to
// (item.categoryNames, 035-item-multiple-categories) rather than just the
// bare MenuItem[]. Once an item can be fanned into more than one category's
// `items` array (getMenuData()), iterating `categories` directly would
// otherwise produce one duplicate SearchResult per category the item
// belongs to — deduped here by item id instead, since item.categoryNames
// already carries the full set of matching category names on its own.
export function filterItems(categories: MenuCategory[], query: string): SearchResult[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const seen = new Set<string>();
  const results: SearchResult[] = [];

  for (const category of categories) {
    for (const item of category.items) {
      if (seen.has(item.id)) continue;
      const matches =
        item.name.toLowerCase().includes(trimmed) ||
        (item.description?.toLowerCase().includes(trimmed) ?? false);
      if (!matches) continue;
      seen.add(item.id);
      results.push({ item, categoryNames: item.categoryNames });
    }
  }

  return results;
}
