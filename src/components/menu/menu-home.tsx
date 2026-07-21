"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { CategoryTabs } from "./category-tabs";
import { ItemCard } from "./item-card";
import { LanguageSelector } from "./language-selector";
import { applyTranslations } from "@/lib/menu/translations";
import { LANG_COOKIE_NAME, matchDisplayLanguage } from "@/lib/menu/types";
import type { Business, MenuCategory, Translations, DisplayLanguage } from "@/lib/menu/types";

export function MenuHome({
  business,
  sourceCategories,
  initialLanguage,
  initialCategories,
  needsClientProbe,
  initialActiveCategoryId,
}: {
  business: Business;
  sourceCategories: MenuCategory[];
  initialLanguage: DisplayLanguage;
  initialCategories: MenuCategory[];
  needsClientProbe: boolean;
  initialActiveCategoryId?: string;
}) {
  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage);
  const [categoriesByLanguage, setCategoriesByLanguage] = useState<
    Partial<Record<DisplayLanguage, MenuCategory[]>>
  >({ [initialLanguage]: initialCategories });
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    sourceCategories.some((category) => category.id === initialActiveCategoryId)
      ? initialActiveCategoryId!
      : sourceCategories[0]?.id ?? null
  );

  const categories = categoriesByLanguage[currentLanguage] ?? sourceCategories;

  // Next's client Router Cache can restore a stale cached render (the
  // original pre-tap props) on a native back/forward gesture, since our
  // history.replaceState below updates the address bar without Next's
  // router ever learning about it. window.location is always accurate
  // even when the restored props aren't, so re-sync from it on mount and
  // on every popstate rather than trusting initialActiveCategoryId alone.
  useEffect(() => {
    function syncActiveCategoryFromUrl() {
      const catFromUrl = new URLSearchParams(window.location.search).get("cat");
      if (catFromUrl && sourceCategories.some((category) => category.id === catFromUrl)) {
        setActiveCategoryId(catFromUrl);
      }
    }
    syncActiveCategoryFromUrl();
    window.addEventListener("popstate", syncActiveCategoryFromUrl);
    return () => window.removeEventListener("popstate", syncActiveCategoryFromUrl);
  }, [sourceCategories]);

  // Accept-Language was completely absent from the request — the only
  // signal SSR couldn't use. Probe navigator.language once and prime the
  // cookie for the *next* visit; never touches what's already rendered.
  useEffect(() => {
    if (!needsClientProbe) return;
    const match = matchDisplayLanguage(navigator.language);
    if (match) setLangCookie(match);
  }, [needsClientProbe]);

  async function handleLanguageChange(language: DisplayLanguage) {
    if (language === currentLanguage) return;

    setCurrentLanguage(language);
    setLangCookie(language);

    if (categoriesByLanguage[language]) return;

    try {
      const response = await fetch(`/menu/${business.slug}/translations?lang=${language}`);
      if (!response.ok) throw new Error("translation fetch failed");
      const translations: Translations = await response.json();
      setCategoriesByLanguage((cache) => ({
        ...cache,
        [language]: applyTranslations(sourceCategories, translations),
      }));
    } catch {
      // Language toggle is a convenience layer, not core content — fall back
      // to source-language content for this session rather than erroring.
      setCategoriesByLanguage((cache) => ({ ...cache, [language]: sourceCategories }));
    }
  }

  function handleCategorySelect(categoryId: string) {
    setActiveCategoryId(categoryId);
    const url = new URL(window.location.href);
    url.searchParams.set("cat", categoryId);
    window.history.replaceState(null, "", url);
  }

  return (
    <>
      <header className="flex items-center gap-3 border-b border-border bg-card p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary font-heading text-[1.1rem] font-bold text-primary-foreground">
          {business.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logoUrl}
              alt=""
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            initials(business.name)
          )}
        </div>
        <h1 className="min-w-0 flex-1 truncate text-[1.15rem] leading-tight">{business.name}</h1>
        {business.plan === "pro" && (
          <LanguageSelector current={currentLanguage} onChange={handleLanguageChange} />
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <Link
          href={`/menu/${business.slug}/search`}
          className="mx-4 mt-3 flex items-center gap-2 rounded-full border border-border bg-muted px-3.5 py-2.5 text-[0.9rem] text-muted-foreground no-underline"
        >
          <Search size={16} className="shrink-0 opacity-70" />
          <span>Search the menu…</span>
        </Link>

        {categories.length === 0 ? (
          <p className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
            No menu items yet.
          </p>
        ) : (
          <>
            <CategoryTabs
              categories={categories}
              activeCategoryId={activeCategoryId}
              onSelect={handleCategorySelect}
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
                    <ItemCard item={item} slug={business.slug} categoryId={category.id} />
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

function setLangCookie(language: DisplayLanguage) {
  document.cookie = `${LANG_COOKIE_NAME}=${language}; path=/; max-age=31536000; samesite=lax`;
}
