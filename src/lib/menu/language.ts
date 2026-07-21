import { cookies, headers } from "next/headers";
import { LANG_COOKIE_NAME, isDisplayLanguage, type DisplayLanguage } from "./types";

// hapag_lang cookie (set by a previous toggle) wins; otherwise derive from
// Accept-Language, restricted to en/ko/ja/zh — fil is source-only, never a
// translation target, so it falls through to the "en" default like any
// other unsupported tag.
export async function getInitialDisplayLanguage(): Promise<DisplayLanguage> {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get(LANG_COOKIE_NAME)?.value;
  if (isDisplayLanguage(cookieLang)) return cookieLang;

  const headerStore = await headers();
  const fromHeader = parseAcceptLanguage(headerStore.get("accept-language"));
  return fromHeader ?? "en";
}

function parseAcceptLanguage(header: string | null): DisplayLanguage | null {
  if (!header) return null;

  const tags = header
    .split(",")
    .map((part) => {
      const [tag, qPart] = part.trim().split(";q=");
      return { tag: tag.split("-")[0].toLowerCase(), q: qPart ? parseFloat(qPart) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of tags) {
    if (isDisplayLanguage(tag)) return tag;
  }
  return null;
}
