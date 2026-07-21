import type { MenuCategory, MenuItem } from "./types";

// Case-insensitive substring match against item name and description — not
// exact-match, not word-boundary. Checks whichever MenuCategory[] is
// currently active (the caller passes translated categories for the
// current display language), so this naturally follows the Pro-plan
// language toggle without any language-specific branching here. Item name
// is never translated, so name matching is language-independent by
// construction — see translations.ts.
export function filterItems(categories: MenuCategory[], query: string): MenuItem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  return categories.flatMap((category) =>
    category.items.filter(
      (item) =>
        item.name.toLowerCase().includes(trimmed) ||
        (item.description?.toLowerCase().includes(trimmed) ?? false)
    )
  );
}
