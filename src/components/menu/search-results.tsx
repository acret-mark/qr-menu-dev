"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search, SearchX } from "lucide-react";
import { ItemCard } from "./item-card";
import { LanguageSelector } from "./language-selector";
import { useTranslatedCategories } from "@/lib/menu/use-translated-categories";
import { filterItems } from "@/lib/menu/search";
import type { Business, MenuCategory, DisplayLanguage } from "@/lib/menu/types";

export function SearchResults({
  business,
  sourceCategories,
  initialLanguage,
  initialCategories,
  needsClientProbe,
  initialQuery,
}: {
  business: Business;
  sourceCategories: MenuCategory[];
  initialLanguage: DisplayLanguage;
  initialCategories: MenuCategory[];
  needsClientProbe: boolean;
  initialQuery: string;
}) {
  const { currentLanguage, categories, handleLanguageChange } = useTranslatedCategories({
    slug: business.slug,
    sourceCategories,
    initialLanguage,
    initialCategories,
    needsClientProbe,
  });

  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Mirrors menu-home.tsx's popstate resync (see useTranslatedCategories'
  // sibling logic there): Next's client Router Cache can restore a stale
  // cached render on a native back/forward gesture, so re-sync the query
  // from window.location (always accurate) rather than trusting
  // initialQuery alone once mounted.
  useEffect(() => {
    function syncQueryFromUrl() {
      setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
    }
    window.addEventListener("popstate", syncQueryFromUrl);
    return () => window.removeEventListener("popstate", syncQueryFromUrl);
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("q", value);
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState(null, "", url);
  }

  const trimmedQuery = query.trim();
  const results = filterItems(categories, query);

  return (
    <>
      <header className="flex items-center gap-3 border-b border-border bg-card p-4">
        <Link
          href={`/menu/${business.slug}`}
          aria-label="Back to menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted"
        >
          <ChevronLeft size={18} />
        </Link>
        <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-muted px-3.5 py-2.5 text-[0.9rem]">
          <Search size={16} className="shrink-0 opacity-70" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Search the menu…"
            className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        {business.plan === "pro" && (
          <LanguageSelector current={currentLanguage} onChange={handleLanguageChange} />
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {!trimmedQuery ? (
          <p className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
            Start typing to search the menu.
          </p>
        ) : results.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-muted text-muted-foreground">
              <SearchX size={26} strokeWidth={2} />
            </div>
            <h1 className="text-xl">No matches for &ldquo;{trimmedQuery}&rdquo;</h1>
            <p className="max-w-[32ch] text-sm text-muted-foreground">
              Try a different search term, or{" "}
              <Link href={`/menu/${business.slug}`} className="text-primary no-underline">
                browse by category
              </Link>{" "}
              instead.
            </p>
          </div>
        ) : (
          <>
            <div className="px-4 pb-1 pt-3 text-[0.82rem] text-muted-foreground">
              {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{trimmedQuery}&rdquo;
            </div>
            <ul className="flex flex-col gap-3 px-4 pb-6 pt-1">
              {results.map((item) => (
                <li key={item.id}>
                  <ItemCard item={item} slug={business.slug} searchQuery={query} />
                </li>
              ))}
            </ul>
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
