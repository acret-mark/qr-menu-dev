"use client";

import { useEffect, useState } from "react";
import { applyTranslations } from "./translations";
import { LANG_COOKIE_NAME, matchDisplayLanguage } from "./types";
import type { MenuCategory, Translations, DisplayLanguage } from "./types";

export function useTranslatedCategories({
  slug,
  sourceCategories,
  initialLanguage,
  initialCategories,
  needsClientProbe,
}: {
  slug: string;
  sourceCategories: MenuCategory[];
  initialLanguage: DisplayLanguage;
  initialCategories: MenuCategory[];
  needsClientProbe: boolean;
}) {
  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage);
  const [categoriesByLanguage, setCategoriesByLanguage] = useState<
    Partial<Record<DisplayLanguage, MenuCategory[]>>
  >({ [initialLanguage]: initialCategories });

  const categories = categoriesByLanguage[currentLanguage] ?? sourceCategories;

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
      const response = await fetch(`/menu/${slug}/translations?lang=${language}`);
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

  return { currentLanguage, categories, handleLanguageChange };
}

function setLangCookie(language: DisplayLanguage) {
  document.cookie = `${LANG_COOKIE_NAME}=${language}; path=/; max-age=31536000; samesite=lax`;
}
