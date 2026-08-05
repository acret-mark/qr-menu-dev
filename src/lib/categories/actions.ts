"use server";

import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DISPLAY_LANGUAGES, type DisplayLanguage, type SourceLanguage } from "@/lib/menu/types";
import { hashCategoryName } from "./hash";
import { translateText } from "@/lib/deepl/client";
import type { OwnerCategory } from "./types";

export type SaveCategoryInput = {
  id?: string;
  name: string;
};

/**
 * Translate-on-save (FR-011/FR-011a/FR-012/FR-013, research.md §3): for each
 * display language other than one matching the business's source language,
 * skip languages whose category_translations row already matches the
 * current name's hash, and upsert the rest — attempted concurrently and
 * awaited in full before saveCategory returns, so a failed language never
 * blocks the others or the category's own save. Returns whether any
 * required language is still missing/stale afterward (FR-013a).
 */
async function applyTranslations(
  supabase: SupabaseClient,
  categoryId: string,
  businessId: string,
  name: string,
  sourceLanguage: SourceLanguage
): Promise<boolean> {
  const requiredLanguages = DISPLAY_LANGUAGES.filter((lang) => lang !== sourceLanguage);
  const currentHash = hashCategoryName(name);

  const { data: existingRows } = await supabase
    .from("category_translations")
    .select("language_code, source_hash")
    .eq("category_id", categoryId);

  const existingByLanguage = new Map(
    (existingRows ?? []).map((row) => [row.language_code as DisplayLanguage, row.source_hash])
  );

  const staleLanguages = requiredLanguages.filter(
    (lang) => existingByLanguage.get(lang) !== currentHash
  );

  await Promise.allSettled(
    staleLanguages.map(async (lang) => {
      const result = await translateText(name, lang);
      if (!result.ok) {
        console.error(`saveCategory: translation failed for category ${categoryId} -> ${lang}`);
        return;
      }

      const { error } = await supabase.from("category_translations").upsert(
        {
          category_id: categoryId,
          business_id: businessId,
          language_code: lang,
          translated_name: result.text,
          source_hash: currentHash,
        },
        { onConflict: "category_id,language_code" }
      );

      if (error) {
        console.error(`saveCategory: upsert failed for category ${categoryId} -> ${lang}`, error);
      }
    })
  );

  const { data: finalRows } = await supabase
    .from("category_translations")
    .select("language_code, source_hash")
    .eq("category_id", categoryId);

  const finalByLanguage = new Map(
    (finalRows ?? []).map((row) => [row.language_code as DisplayLanguage, row.source_hash])
  );

  return requiredLanguages.some((lang) => finalByLanguage.get(lang) !== currentHash);
}

export type SaveCategoryResult =
  | { ok: true; category: OwnerCategory }
  | { ok: false; reason: string };

export async function saveCategory(input: SaveCategoryInput): Promise<SaveCategoryResult> {
  const name = input.name.trim();
  if (!name) {
    return { ok: false, reason: "empty-name" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "not-authenticated" };
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, source_language")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessError || !business) {
    return { ok: false, reason: "no-business" };
  }

  if (input.id) {
    const { data, error } = await supabase
      .from("categories")
      .update({ name })
      .eq("id", input.id)
      .eq("business_id", business.id)
      .select("id, name, sort_order")
      .single();

    if (error || !data) {
      return { ok: false, reason: error?.message ?? "update-failed" };
    }

    const hasStaleTranslation = await applyTranslations(
      supabase,
      data.id,
      business.id,
      data.name,
      business.source_language
    );

    return {
      ok: true,
      category: {
        id: data.id,
        name: data.name,
        sortOrder: data.sort_order,
        itemCount: 0,
        hasStaleTranslation,
      },
    };
  }

  const { data: maxRow } = await supabase
    .from("categories")
    .select("sort_order")
    .eq("business_id", business.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSortOrder = maxRow ? maxRow.sort_order + 1 : 0;

  const { data, error } = await supabase
    .from("categories")
    .insert({ business_id: business.id, name, sort_order: nextSortOrder })
    .select("id, name, sort_order")
    .single();

  if (error || !data) {
    return { ok: false, reason: error?.message ?? "insert-failed" };
  }

  const hasStaleTranslation = await applyTranslations(
    supabase,
    data.id,
    business.id,
    data.name,
    business.source_language
  );

  return {
    ok: true,
    category: {
      id: data.id,
      name: data.name,
      sortOrder: data.sort_order,
      itemCount: 0,
      hasStaleTranslation,
    },
  };
}

export type DeleteCategoryInput = {
  id: string;
};

export type DeleteCategoryResult = { ok: true } | { ok: false; reason: string };

export async function deleteCategory(input: DeleteCategoryInput): Promise<DeleteCategoryResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "not-authenticated" };
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessError || !business) {
    return { ok: false, reason: "no-business" };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", input.id)
    .eq("business_id", business.id);

  if (error) {
    return { ok: false, reason: error.message };
  }

  return { ok: true };
}

export type ReorderCategoryInput = {
  id: string;
  direction: "up" | "down";
};

export type ReorderCategoryResult = { ok: true } | { ok: false; reason: "boundary" | string };

export async function reorderCategory(
  input: ReorderCategoryInput
): Promise<ReorderCategoryResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "not-authenticated" };
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessError || !business) {
    return { ok: false, reason: "no-business" };
  }

  const { data: categories, error: listError } = await supabase
    .from("categories")
    .select("id, sort_order")
    .eq("business_id", business.id)
    .order("sort_order", { ascending: true });

  if (listError || !categories) {
    return { ok: false, reason: listError?.message ?? "list-failed" };
  }

  const index = categories.findIndex((category) => category.id === input.id);
  if (index === -1) {
    return { ok: false, reason: "not-found" };
  }

  const neighborIndex = input.direction === "up" ? index - 1 : index + 1;
  if (neighborIndex < 0 || neighborIndex >= categories.length) {
    return { ok: false, reason: "boundary" };
  }

  const current = categories[index];
  const neighbor = categories[neighborIndex];

  const [currentResult, neighborResult] = await Promise.all([
    supabase
      .from("categories")
      .update({ sort_order: neighbor.sort_order })
      .eq("id", current.id)
      .eq("business_id", business.id),
    supabase
      .from("categories")
      .update({ sort_order: current.sort_order })
      .eq("id", neighbor.id)
      .eq("business_id", business.id),
  ]);

  if (currentResult.error || neighborResult.error) {
    return { ok: false, reason: currentResult.error?.message ?? neighborResult.error!.message };
  }

  return { ok: true };
}
