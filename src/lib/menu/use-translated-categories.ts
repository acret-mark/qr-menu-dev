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
  const [isTranslating, setIsTranslating] = useState(false);
  // Languages whose cached entry is a failure fallback (source-language
  // text standing in for a translation that couldn't be fetched) rather
  // than a real translation — drives the "showing original text" banner so
  // that fallback is never mistaken for a genuine translation, including on
  // a later visit to the same language that skips re-fetching (see the
  // cache-hit branch below).
  const [unavailableLanguages, setUnavailableLanguages] = useState<Set<DisplayLanguage>>(
    new Set()
  );

  const categories = categoriesByLanguage[currentLanguage] ?? sourceCategories;
  const translationUnavailable = unavailableLanguages.has(currentLanguage);

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

    setLangCookie(language);

    if (categoriesByLanguage[language]) {
      setCurrentLanguage(language);
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch(`/menu/${slug}/translations?lang=${language}`);
      if (!response.ok) throw new Error("translation fetch failed");
      const translations: Translations = await response.json();
      setCategoriesByLanguage((cache) => ({
        ...cache,
        [language]: applyTranslations(sourceCategories, translations),
      }));
      setUnavailableLanguages((languages) => {
        if (!languages.has(language)) return languages;
        const next = new Set(languages);
        next.delete(language);
        return next;
      });
      setCurrentLanguage(language);
    } catch {
      // Language toggle is a convenience layer, not core content — fall back
      // to source-language content for this session rather than erroring,
      // but flag it (translationUnavailable) so the customer isn't misled
      // into thinking untranslated text is a real translation.
      setCategoriesByLanguage((cache) => ({ ...cache, [language]: sourceCategories }));
      setUnavailableLanguages((languages) => new Set(languages).add(language));
      setCurrentLanguage(language);
    } finally {
      setIsTranslating(false);
    }
  }

  return { currentLanguage, categories, handleLanguageChange, isTranslating, translationUnavailable };
}

function setLangCookie(language: DisplayLanguage) {
  document.cookie = `${LANG_COOKIE_NAME}=${language}; path=/; max-age=31536000; samesite=lax`;
}
