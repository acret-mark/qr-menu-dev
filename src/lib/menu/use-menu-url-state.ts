"use client";

import { useEffect, useState } from "react";
import type { MenuCategory } from "./types";

// Consolidates the cat/q/item URL-state pattern that used to be duplicated
// between menu-home.tsx's activeCategoryId effect and search-results.tsx's
// query effect (see research.md §5). Owns a single history.replaceState
// mechanism and a single popstate listener for all three params, so their
// interaction rules (data-model.md) — e.g. clearing q also clears item —
// are enforced in one place.
//
// Never imports next/navigation's useRouter/redirect: only
// window.history.replaceState and a manual popstate listener, mirroring
// the existing defensive-resync rationale in menu-home.tsx (Next's client
// Router Cache can restore a stale cached render on a native back/forward
// gesture; window.location is always accurate).
export function useMenuUrlState({
  sourceCategories,
  initialCategoryId,
  initialQuery,
  initialItemId,
}: {
  sourceCategories: MenuCategory[];
  initialCategoryId?: string;
  initialQuery?: string;
  initialItemId?: string;
}) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    sourceCategories.some((category) => category.id === initialCategoryId)
      ? initialCategoryId!
      : sourceCategories[0]?.id ?? null
  );
  const [query, setQueryState] = useState(initialQuery ?? "");
  const [expandedItemId, setExpandedItemId] = useState<string | null>(initialItemId ?? null);

  // Next's client Router Cache can restore a stale cached render (the
  // original pre-tap props) on a native back/forward gesture, since our
  // history.replaceState calls below update the address bar without Next's
  // router ever learning about it. window.location is always accurate even
  // when the restored props aren't, so re-sync from it on mount and on
  // every popstate rather than trusting the initial* props alone.
  useEffect(() => {
    function syncFromUrl() {
      const params = new URLSearchParams(window.location.search);

      const catFromUrl = params.get("cat");
      if (catFromUrl && sourceCategories.some((category) => category.id === catFromUrl)) {
        setActiveCategoryId(catFromUrl);
      }

      setQueryState(params.get("q") ?? "");
      setExpandedItemId(params.get("item"));
    }
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [sourceCategories]);

  function selectCategory(categoryId: string) {
    setActiveCategoryId(categoryId);
    const url = new URL(window.location.href);
    url.searchParams.set("cat", categoryId);
    window.history.replaceState(null, "", url);
  }

  function setQuery(value: string) {
    setQueryState(value);
    const url = new URL(window.location.href);
    if (value.trim()) {
      url.searchParams.set("q", value);
    } else {
      // Clearing q also clears item (data-model.md rule 4): there is no
      // category context to keep an accordion open against once the flat
      // search-result list it was part of disappears.
      setExpandedItemId(null);
      url.searchParams.delete("q");
      url.searchParams.delete("item");
    }
    window.history.replaceState(null, "", url);
  }

  function toggleItem(itemId: string) {
    const url = new URL(window.location.href);
    if (itemId === expandedItemId) {
      setExpandedItemId(null);
      url.searchParams.delete("item");
    } else {
      // Only one item expanded at a time (data-model.md rule 5) — always
      // replaces the previous value, never appends.
      setExpandedItemId(itemId);
      url.searchParams.set("item", itemId);
    }
    window.history.replaceState(null, "", url);
  }

  return { activeCategoryId, query, expandedItemId, selectCategory, setQuery, toggleItem };
}
