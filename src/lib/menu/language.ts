import { cookies, headers } from "next/headers";
import {
  LANG_COOKIE_NAME,
  isDisplayLanguage,
  matchDisplayLanguage,
  type DisplayLanguage,
  type SourceLanguage,
} from "./types";

export interface InitialLanguageResult {
  language: DisplayLanguage;
  // No detected preference to translate towards (e.g. a fil-sourced
  // business with no matching cookie/header) — render source content
  // directly rather than attempting a fetch that was never going to have
  // a matching row.
  skipTranslation: boolean;
  // Accept-Language was completely absent from the request (not merely
  // unsupported) — the one case SSR had zero signal to work with, so the
  // client should probe navigator.language once and prime the cookie for
  // the next visit.
  needsClientProbe: boolean;
}

// hapag_lang cookie (set by a previous toggle, or the client-side
// navigator.language probe) wins; otherwise derive from Accept-Language.
// If neither yields a supported language, fall back to the business's
// source_language when that's itself a valid display language ("en") — a
// fil-sourced business has no display-language equivalent, so it falls
// back to "en" as a UI placeholder with translation skipped entirely.
export async function getInitialDisplayLanguage(
  sourceLanguage: SourceLanguage
): Promise<InitialLanguageResult> {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get(LANG_COOKIE_NAME)?.value;
  if (isDisplayLanguage(cookieLang)) {
    return { language: cookieLang, skipTranslation: false, needsClientProbe: false };
  }

  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language");
  const fromHeader = parseAcceptLanguage(acceptLanguage);
  if (fromHeader) {
    return { language: fromHeader, skipTranslation: false, needsClientProbe: false };
  }

  return {
    ...sourceLanguageFallback(sourceLanguage),
    needsClientProbe: acceptLanguage === null,
  };
}

function sourceLanguageFallback(
  sourceLanguage: SourceLanguage
): Pick<InitialLanguageResult, "language" | "skipTranslation"> {
  return isDisplayLanguage(sourceLanguage)
    ? { language: sourceLanguage, skipTranslation: false }
    : { language: "en", skipTranslation: true };
}

function parseAcceptLanguage(header: string | null): DisplayLanguage | null {
  if (!header) return null;

  const tags = header
    .split(",")
    .map((part) => {
      const [tag, qPart] = part.trim().split(";q=");
      return { tag, q: qPart ? parseFloat(qPart) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of tags) {
    const match = matchDisplayLanguage(tag);
    if (match) return match;
  }
  return null;
}
