"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import { cloudinaryLoader } from "@/lib/images/cloudinary";
import { CategoryTabs } from "./category-tabs";
import { ItemCard } from "./item-card";
import { LanguageSelector } from "./language-selector";
import { OfflineIndicator } from "./offline-indicator";
import { TranslationUnavailableBanner } from "./translation-unavailable-banner";
import { useTranslatedCategories } from "@/lib/menu/use-translated-categories";
import { useMenuUrlState } from "@/lib/menu/use-menu-url-state";
import { filterItems } from "@/lib/menu/search";
import type { Business, MenuCategory, DisplayLanguage } from "@/lib/menu/types";

export function MenuHome({
  business,
  sourceCategories,
  initialLanguage,
  initialCategories,
  needsClientProbe,
  initialActiveCategoryId,
  initialQuery,
  initialItemId,
}: {
  business: Business;
  sourceCategories: MenuCategory[];
  initialLanguage: DisplayLanguage;
  initialCategories: MenuCategory[];
  needsClientProbe: boolean;
  initialActiveCategoryId?: string;
  initialQuery?: string;
  initialItemId?: string;
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
      initialCategoryId: initialActiveCategoryId,
      initialQuery,
      initialItemId,
    });

  const trimmedQuery = query.trim();
  const results = trimmedQuery ? filterItems(categories, query) : [];

  return (
    <>
      <OfflineIndicator />
      {translationUnavailable && <TranslationUnavailableBanner />}
      <header className="flex items-center gap-3 border-b border-border bg-card p-4">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary font-heading text-[1.1rem] font-bold text-primary-foreground">
          {business.logoUrl ? (
            <Image
              loader={cloudinaryLoader}
              src={business.logoUrl}
              alt=""
              fill
              sizes="44px"
              priority
              className="rounded-lg object-cover"
            />
          ) : (
            initials(business.name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[1.15rem] leading-tight">{business.name}</h1>
          {business.address && (
            <p className="truncate text-[0.78rem] leading-tight text-muted-foreground">
              {business.address}
            </p>
          )}
        </div>
        {business.plan === "pro" && (
          <LanguageSelector
            current={currentLanguage}
            onChange={handleLanguageChange}
            isTranslating={isTranslating}
          />
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto [overflow-anchor:none]">
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-full border border-border bg-muted px-3.5 py-2.5 text-[0.9rem]">
          <Search size={16} className="shrink-0 opacity-70" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the menu…"
            className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

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
              <ul className="flex flex-col gap-3 px-4 pb-6 pt-1">
                {results.map(({ item, categoryName }) => (
                  <li key={item.id}>
                    <ItemCard
                      item={item}
                      categoryName={categoryName}
                      isExpanded={item.id === expandedItemId}
                      onToggle={() => toggleItem(item.id)}
                    />
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
          <>
            <CategoryTabs
              categories={categories}
              activeCategoryId={activeCategoryId}
              onSelect={selectCategory}
            />

            {categories.map((category) => (
              <ul
                key={category.id}
                className={
                  category.id === activeCategoryId
                    ? "flex flex-col gap-3 px-4 pb-6 pt-3"
                    : "hidden"
                }
              >
                {category.items.map((item) => (
                  <li key={item.id}>
                    <ItemCard
                      item={item}
                      categoryName={category.name}
                      isExpanded={category.id === activeCategoryId && item.id === expandedItemId}
                      onToggle={() => toggleItem(item.id)}
                    />
                  </li>
                ))}
              </ul>
            ))}
          </>
        )}
      </div>

      {business.plan === "standard" && (
        <footer className="shrink-0 border-t border-border bg-card px-4 py-2.5 text-center text-[0.76rem] text-muted-foreground">
          <Link href="/register" className="no-underline">
            Want this smart digital menu for your food business?{" "}
            <strong className="font-heading text-primary">Grab yours now</strong>
          </Link>
        </footer>
      )}
    </>
  );
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
