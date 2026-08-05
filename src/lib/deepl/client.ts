import type { DisplayLanguage } from "@/lib/menu/types";

const DEEPL_TARGET_LANG: Record<DisplayLanguage, string> = {
  en: "EN-US",
  ko: "KO",
  ja: "JA",
  zh: "ZH",
};

export type TranslateResult = { ok: true; text: string } | { ok: false };

export async function translateText(
  text: string,
  targetLanguage: DisplayLanguage
): Promise<TranslateResult> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    console.error("translateText: DEEPL_API_KEY is not configured");
    return { ok: false };
  }

  const host = apiKey.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";

  try {
    const response = await fetch(`https://${host}/v2/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        text,
        target_lang: DEEPL_TARGET_LANG[targetLanguage],
      }),
    });

    if (!response.ok) {
      console.error(`translateText: DeepL responded ${response.status} for "${targetLanguage}"`);
      return { ok: false };
    }

    const data = (await response.json()) as { translations?: { text: string }[] };
    const translated = data.translations?.[0]?.text;
    if (!translated) {
      console.error(`translateText: DeepL returned no translation for "${targetLanguage}"`);
      return { ok: false };
    }

    return { ok: true, text: translated };
  } catch (error) {
    console.error(`translateText: request failed for "${targetLanguage}"`, error);
    return { ok: false };
  }
}
