"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Search, SearchX } from "lucide-react";
import { cloudinaryLoader } from "@/lib/images/cloudinary";
import { CategoryTabs } from "./category-tabs";
import { ItemCard } from "./item-card";
import { ItemDetailSheet } from "./item-detail-sheet";
import { LanguageSelector } from "./language-selector";
import { OfflineIndicator } from "./offline-indicator";
import { TranslationUnavailableBanner } from "./translation-unavailable-banner";
import { useTranslatedCategories } from "@/lib/menu/use-translated-categories";
import { useMenuUrlState } from "@/lib/menu/use-menu-url-state";
import { filterItems } from "@/lib/menu/search";
import type { Business, MenuCategory, DisplayLanguage } from "@/lib/menu/types";

// Scattered-block pattern echoing a QR code's own pixel mosaic (matching
// mockup/3-menu.jpg's hero exactly, not just "some texture") — a fitting
// motif for a *QR* menu product. Only white/transparent shapes are baked
// into the SVG string — the actual orange still comes from `bg-primary` (see
// its use below), so no brand hex is duplicated outside tokens.css. This is
// the *default* hero background — a business with a logo uploaded uses that
// instead (see MenuHome below); this pattern is the no-logo fallback only.
const HERO_PATTERN_URL =
  "url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2780%27%20height%3D%2780%27%3E%3Crect%20x%3D%274%27%20y%3D%274%27%20width%3D%2710%27%20height%3D%2710%27%20fill%3D%27white%27%20opacity%3D%270.1%27/%3E%3Crect%20x%3D%2720%27%20y%3D%272%27%20width%3D%2714%27%20height%3D%2714%27%20fill%3D%27white%27%20opacity%3D%270.08%27/%3E%3Crect%20x%3D%2740%27%20y%3D%2710%27%20width%3D%278%27%20height%3D%278%27%20fill%3D%27white%27%20opacity%3D%270.12%27/%3E%3Crect%20x%3D%2758%27%20y%3D%274%27%20width%3D%2712%27%20height%3D%2712%27%20fill%3D%27white%27%20opacity%3D%270.07%27/%3E%3Crect%20x%3D%2710%27%20y%3D%2724%27%20width%3D%2716%27%20height%3D%2716%27%20fill%3D%27white%27%20opacity%3D%270.09%27/%3E%3Crect%20x%3D%2734%27%20y%3D%2728%27%20width%3D%2710%27%20height%3D%2710%27%20fill%3D%27white%27%20opacity%3D%270.11%27/%3E%3Crect%20x%3D%2754%27%20y%3D%2726%27%20width%3D%2714%27%20height%3D%2714%27%20fill%3D%27white%27%20opacity%3D%270.08%27/%3E%3Crect%20x%3D%272%27%20y%3D%2744%27%20width%3D%2712%27%20height%3D%2712%27%20fill%3D%27white%27%20opacity%3D%270.1%27/%3E%3Crect%20x%3D%2724%27%20y%3D%2746%27%20width%3D%278%27%20height%3D%278%27%20fill%3D%27white%27%20opacity%3D%270.09%27/%3E%3Crect%20x%3D%2744%27%20y%3D%2742%27%20width%3D%2716%27%20height%3D%2716%27%20fill%3D%27white%27%20opacity%3D%270.07%27/%3E%3Crect%20x%3D%2764%27%20y%3D%2748%27%20width%3D%2710%27%20height%3D%2710%27%20fill%3D%27white%27%20opacity%3D%270.11%27/%3E%3Crect%20x%3D%2714%27%20y%3D%2762%27%20width%3D%2714%27%20height%3D%2714%27%20fill%3D%27white%27%20opacity%3D%270.08%27/%3E%3Crect%20x%3D%2736%27%20y%3D%2764%27%20width%3D%2710%27%20height%3D%2710%27%20fill%3D%27white%27%20opacity%3D%270.1%27/%3E%3Crect%20x%3D%2756%27%20y%3D%2766%27%20width%3D%2712%27%20height%3D%2712%27%20fill%3D%27white%27%20opacity%3D%270.09%27/%3E%3C/svg%3E\")";

export function MenuHome({
  business,
  sourceCategories,
  initialLanguage,
  initialCategories,
  needsClientProbe,
  initialCategoryIndex,
  initialQuery,
  initialItemIndex,
}: {
  business: Business;
  sourceCategories: MenuCategory[];
  initialLanguage: DisplayLanguage;
  initialCategories: MenuCategory[];
  needsClientProbe: boolean;
  initialCategoryIndex?: string;
  initialQuery?: string;
  initialItemIndex?: string;
}) {
  const { currentLanguage, categories, handleLanguageChange, isTranslating, translationUnavailable } =
    useTranslatedCategories({
      slug: business.slug,
      sourceCategories,
      initialLanguage,
      initialCategories,
      needsClientProbe,
    });

  const { activeCategoryId, query, expandedItemId, selectCategory, setQuery, toggleItem } =
    useMenuUrlState({
      sourceCategories,
      initialCategoryIndex,
      initialQuery,
      initialItemIndex,
    });

  const trimmedQuery = query.trim();
  const results = trimmedQuery ? filterItems(categories, query) : [];

  // The item-detail sheet renders once here, not per-row inside ItemCard —
  // only one item is ever expanded at a time (useMenuUrlState's existing
  // single-expand rule), and it now needs the full item + categoryName,
  // looked up from whichever list (search results or the active category)
  // is currently showing it. Plain computation, no manual useMemo — `results`
  // above isn't memoized either, and the React Compiler (already enabled for
  // this project) handles memoizing derived values like this on its own;
  // hand-rolling useMemo here fought the compiler instead (it couldn't
  // preserve the memo since `results` isn't itself a stable reference).
  function findExpandedEntry() {
    if (!expandedItemId) return null;
    if (trimmedQuery) {
      return results.find((result) => result.item.id === expandedItemId) ?? null;
    }
    for (const category of categories) {
      const item = category.items.find((candidate) => candidate.id === expandedItemId);
      if (item) return { item, categoryName: category.name };
    }
    return null;
  }
  const expandedEntry = findExpandedEntry();

  return (
    <>
      <OfflineIndicator />
      {translationUnavailable && <TranslationUnavailableBanner />}
      {/* Full-bleed hero + rounded-overlap identity panel, replacing the old
          logo-avatar header row (specs/026-menu-home-rebrand, spec
          FR-001/002/004/005). Background is dynamic per business: a business
          with a logo uploaded shows that logo filling the hero (object-cover,
          with a light scrim so the white on-hero language pill stays legible
          regardless of the logo's own colors); a business with no logo falls
          back to the default `bg-primary` + QR-block pattern. Either way this
          costs zero extra JS against this route's performance budget — the
          pattern is CSS-only and the logo (when present) is already fetched
          for other screens via the same Cloudinary URL, not a new asset. */}
      {/* No `overflow-hidden` here — the language-selector dropdown below is
          a descendant of this div, and an ancestor's overflow:hidden would
          clip it wherever the dropdown list extends past the hero's own
          bounds (which it does — 4 languages is taller than the hero).
          The logo/pattern layer doesn't need it either: both `next/image`'s
          `fill` and the pattern div's `inset-0` already conform exactly to
          this div's padding box on their own. */}
      <div className="relative shrink-0 bg-primary px-4 pt-6 pb-14">
        {business.logoUrl ? (
          <>
            <Image
              loader={cloudinaryLoader}
              src={business.logoUrl}
              alt=""
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundImage: HERO_PATTERN_URL, backgroundSize: "80px 80px" }}
          />
        )}
        {business.plan === "pro" && (
          <div className="relative z-10 flex justify-end">
            <LanguageSelector
              variant="on-hero"
              current={currentLanguage}
              onChange={handleLanguageChange}
              isTranslating={isTranslating}
            />
          </div>
        )}
      </div>

      {/* `relative` here is load-bearing, not decorative: the hero above is
          `position: relative` (for its absolutely-positioned logo/pattern
          layer), which makes it a positioned element — CSS's painting-order
          rules put a positioned element above a plain static sibling
          regardless of DOM order, so without this, the hero's sharp-cornered
          background silently painted over this panel's rounded top corners
          in their overlap zone, hiding the rounding entirely. Making this
          panel positioned too restores DOM order (this panel after the
          hero) as what decides the paint order between the two. */}
      <div className="relative -mt-6 shrink-0 rounded-t-[28px] bg-card px-4 pt-8">
        <h1 className="text-center font-heading text-[1.4rem] leading-tight">{business.name}</h1>
        {business.address && (
          <p className="mt-1 flex items-center justify-center gap-1 text-center text-[0.82rem] leading-tight text-muted-foreground">
            <MapPin size={13} className="shrink-0" />
            <span className="truncate">{business.address}</span>
          </p>
        )}

        <div className="mt-6 flex items-center gap-2 rounded-full bg-muted px-3.5 py-3.5 text-[0.9rem]">
          <Search size={16} className="shrink-0 opacity-70" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the menu…"
            className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* CategoryTabs deliberately lives outside the scrolling region below,
          not as a `position: sticky` child of it — WebKit (Safari and, since
          it shares the same engine, Chrome on iOS) has a longstanding bug
          where a sticky element's stuck position visibly jumps when content
          below it changes height (e.g. the accordion expanding), inside a
          flex + overflow-y-auto container. Rendering it here instead, as a
          normal element above a scroll region that contains only the item
          list, makes that bug class structurally impossible rather than
          mitigating it with CSS. */}
      {!trimmedQuery && categories.length > 0 && (
        <CategoryTabs
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelect={selectCategory}
        />
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {trimmedQuery ? (
          results.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-muted text-muted-foreground">
                <SearchX size={26} strokeWidth={2} />
              </div>
              <h2 className="text-xl">No matches for &ldquo;{trimmedQuery}&rdquo;</h2>
              <p className="max-w-[32ch] text-sm text-muted-foreground">
                Try a different search term.
              </p>
            </div>
          ) : (
            <>
              <div className="px-4 pb-1 pt-3 text-[0.82rem] text-muted-foreground">
                {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{trimmedQuery}&rdquo;
              </div>
              <ul className="flex flex-col gap-6 px-4 pb-6 pt-2">
                {results.map(({ item }) => (
                  <li key={item.id}>
                    <ItemCard item={item} onToggle={() => toggleItem(item.id)} />
                  </li>
                ))}
              </ul>
            </>
          )
        ) : categories.length === 0 ? (
          <p className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
            No menu items yet.
          </p>
        ) : (
          categories.map((category) => (
            <ul
              key={category.id}
              className={
                category.id === activeCategoryId
                  ? "flex flex-col gap-6 px-4 pb-6 pt-4"
                  : "hidden"
              }
            >
              {category.items.map((item) => (
                <li key={item.id}>
                  <ItemCard item={item} onToggle={() => toggleItem(item.id)} />
                </li>
              ))}
            </ul>
          ))
        )}
      </div>

      {business.plan === "standard" && (
        <footer className="shrink-0 bg-primary px-4 py-2.5 text-center text-[0.76rem] text-primary-foreground">
          <Link href="/register" className="no-underline">
            Want this smart digital menu for your food business?{" "}
            <strong className="font-heading">Grab yours now</strong>
          </Link>
        </footer>
      )}

      {expandedEntry && (
        <ItemDetailSheet
          item={expandedEntry.item}
          categoryName={expandedEntry.categoryName}
          onClose={() => toggleItem(expandedEntry.item.id)}
        />
      )}
    </>
  );
}
