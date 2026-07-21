export type PlanType = "standard" | "pro";
export type SourceLanguage = "en" | "fil";
export type DisplayLanguage = "en" | "ko" | "ja" | "zh";

export const DISPLAY_LANGUAGES: DisplayLanguage[] = ["en", "ko", "ja", "zh"];

export const LANG_COOKIE_NAME = "hapag_lang";

export function isDisplayLanguage(value: string | null | undefined): value is DisplayLanguage {
  return !!value && (DISPLAY_LANGUAGES as string[]).includes(value);
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  plan: PlanType;
  sourceLanguage: SourceLanguage;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  photoUrl: string | null;
  isSoldOut: boolean;
  isBestSeller: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface Translations {
  categoryNames: Record<string, string>;
  itemDescriptions: Record<string, string>;
}
