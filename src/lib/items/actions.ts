"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getOwnerBusiness } from "@/lib/auth/login";
import { DISPLAY_LANGUAGES, type DisplayLanguage } from "@/lib/menu/types";
import { hashItemDescription, hashIngredientName } from "./hash";
import { translateText } from "@/lib/deepl/client";
import { uploadImage } from "@/lib/cloudinary/client";
import { validateLogoFile } from "@/lib/business/logo-validation";
import { generateDescription } from "@/lib/ai-description/client";
import { checkAndIncrementDailyLimit } from "@/lib/ai-description/rate-limit";

export type SetItemSoldOutInput = {
  id: string;
  isSoldOut: boolean;
};

export type SetItemSoldOutResult = { ok: true } | { ok: false; reason: string };

export async function setItemSoldOut(input: SetItemSoldOutInput): Promise<SetItemSoldOutResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "not-authenticated" };
  }

  const business = await getOwnerBusiness(supabase, user.id);

  if (!business) {
    return { ok: false, reason: "no-business" };
  }

  const { error } = await supabase
    .from("items")
    .update({ is_sold_out: input.isSoldOut })
    .eq("id", input.id)
    .eq("business_id", business.id);

  if (error) {
    return { ok: false, reason: error.message };
  }

  return { ok: true };
}

/**
 * Description translate-on-save (FR-020–FR-024, research.md §4) — a direct
 * port of categories/actions.ts's applyTranslations() onto item_translations.
 * The item's name is never translated (FR-024); only description.
 */
async function applyItemDescriptionTranslations(
  supabase: SupabaseClient,
  itemId: string,
  businessId: string,
  description: string,
  sourceLanguage: string
): Promise<boolean> {
  const requiredLanguages = DISPLAY_LANGUAGES.filter((lang) => lang !== sourceLanguage);

  if (!description.trim()) {
    return false;
  }

  const currentHash = hashItemDescription(description);

  const { data: existingRows } = await supabase
    .from("item_translations")
    .select("language_code, source_hash")
    .eq("item_id", itemId);

  const existingByLanguage = new Map(
    (existingRows ?? []).map((row) => [row.language_code as DisplayLanguage, row.source_hash])
  );

  const staleLanguages = requiredLanguages.filter(
    (lang) => existingByLanguage.get(lang) !== currentHash
  );

  await Promise.allSettled(
    staleLanguages.map(async (lang) => {
      const result = await translateText(description, lang);
      if (!result.ok) {
        console.error(`saveItem: translation failed for item ${itemId} -> ${lang}`);
        return;
      }

      const { error } = await supabase.from("item_translations").upsert(
        {
          item_id: itemId,
          business_id: businessId,
          language_code: lang,
          translated_description: result.text,
          source_hash: currentHash,
        },
        { onConflict: "item_id,language_code" }
      );

      if (error) {
        console.error(`saveItem: upsert failed for item ${itemId} -> ${lang}`, error);
      }
    })
  );

  const { data: finalRows } = await supabase
    .from("item_translations")
    .select("language_code, source_hash")
    .eq("item_id", itemId);

  const finalByLanguage = new Map(
    (finalRows ?? []).map((row) => [row.language_code as DisplayLanguage, row.source_hash])
  );

  return requiredLanguages.some((lang) => finalByLanguage.get(lang) !== currentHash);
}

export type SaveItemInput = {
  id?: string;
  name: string;
  categoryId: string;
  price: number;
  description: string;
  photoUrl: string | null;
  isDisplayed: boolean;
  isSoldOut: boolean;
  isBestSeller: boolean;
  acceptedAiDraft?: { keywords: string[] };
  ingredients: Array<{ id: string } | { name: string }>;
};

/**
 * Ingredients extension (contracts/save-item-ingredients.md, 030-menu-item-
 * ingredients): resolves each `{ name }` entry to an existing or newly-created
 * `ingredients` row (case-insensitive reuse, FR-005), then reconciles
 * `item_ingredients` as a full diff against the item's current rows. A bad
 * `{ id }` (not owned by this business) or a failed create is dropped, never
 * failing the item's own save (contract step 6).
 */
async function reconcileItemIngredients(
  supabase: SupabaseClient,
  itemId: string,
  businessId: string,
  ingredients: Array<{ id: string } | { name: string }>
): Promise<{ id: string; name: string }[]> {
  const { data: existingIngredients } = await supabase
    .from("ingredients")
    .select("id, name")
    .eq("business_id", businessId);

  const byLowerName = new Map<string, string>(
    (existingIngredients ?? []).map((row) => [row.name.toLowerCase(), row.id])
  );
  const nameById = new Map<string, string>(
    (existingIngredients ?? []).map((row) => [row.id, row.name])
  );
  const validIds = new Set((existingIngredients ?? []).map((row) => row.id));

  const resolvedIds = new Set<string>();

  for (const entry of ingredients) {
    if ("id" in entry) {
      if (validIds.has(entry.id)) resolvedIds.add(entry.id);
      continue;
    }

    const name = entry.name.trim();
    if (!name) continue;

    const existingId = byLowerName.get(name.toLowerCase());
    if (existingId) {
      resolvedIds.add(existingId);
      continue;
    }

    const { data: created, error } = await supabase
      .from("ingredients")
      .insert({ business_id: businessId, name })
      .select("id")
      .single();

    if (error || !created) {
      console.error(`saveItem: failed to create ingredient "${name}" for business ${businessId}`, error);
      continue;
    }

    byLowerName.set(name.toLowerCase(), created.id);
    nameById.set(created.id, name);
    resolvedIds.add(created.id);
  }

  const { data: currentRows } = await supabase
    .from("item_ingredients")
    .select("ingredient_id")
    .eq("item_id", itemId);

  const currentIds = new Set((currentRows ?? []).map((row) => row.ingredient_id));

  const toRemove = [...currentIds].filter((ingredientId) => !resolvedIds.has(ingredientId));
  const toAdd = [...resolvedIds].filter((ingredientId) => !currentIds.has(ingredientId));

  if (toRemove.length) {
    const { error } = await supabase
      .from("item_ingredients")
      .delete()
      .eq("item_id", itemId)
      .in("ingredient_id", toRemove);
    if (error) console.error(`saveItem: failed to remove ingredients from item ${itemId}`, error);
  }

  if (toAdd.length) {
    const { error } = await supabase.from("item_ingredients").insert(
      toAdd.map((ingredientId) => ({
        item_id: itemId,
        ingredient_id: ingredientId,
        business_id: businessId,
      }))
    );
    if (error) console.error(`saveItem: failed to attach ingredients to item ${itemId}`, error);
  }

  return [...resolvedIds].map((id) => ({ id, name: nameById.get(id) ?? "" }));
}

/**
 * Ingredient translate-on-save (ingredient-translation follow-on to
 * 030-menu-item-ingredients, which explicitly deferred this): a direct port
 * of categories/actions.ts's applyTranslations() onto ingredient_translations,
 * run once per ingredient currently attached to the saved item. Ingredients
 * are a shared per-business vocabulary (like categories, not per-item text),
 * so re-running this for an already-translated, unchanged ingredient is a
 * cheap no-op via the same source_hash skip used elsewhere.
 */
async function applyIngredientTranslations(
  supabase: SupabaseClient,
  businessId: string,
  ingredients: { id: string; name: string }[],
  sourceLanguage: string
): Promise<void> {
  const requiredLanguages = DISPLAY_LANGUAGES.filter((lang) => lang !== sourceLanguage);
  if (!requiredLanguages.length) return;

  await Promise.allSettled(
    ingredients
      .filter((ingredient) => ingredient.name.trim())
      .map(async (ingredient) => {
        const currentHash = hashIngredientName(ingredient.name);

        const { data: existingRows } = await supabase
          .from("ingredient_translations")
          .select("language_code, source_hash")
          .eq("ingredient_id", ingredient.id);

        const existingByLanguage = new Map(
          (existingRows ?? []).map((row) => [row.language_code as DisplayLanguage, row.source_hash])
        );

        const staleLanguages = requiredLanguages.filter(
          (lang) => existingByLanguage.get(lang) !== currentHash
        );

        await Promise.allSettled(
          staleLanguages.map(async (lang) => {
            const result = await translateText(ingredient.name, lang);
            if (!result.ok) {
              console.error(`saveItem: translation failed for ingredient ${ingredient.id} -> ${lang}`);
              return;
            }

            const { error } = await supabase.from("ingredient_translations").upsert(
              {
                ingredient_id: ingredient.id,
                business_id: businessId,
                language_code: lang,
                translated_name: result.text,
                source_hash: currentHash,
              },
              { onConflict: "ingredient_id,language_code" }
            );

            if (error) {
              console.error(`saveItem: upsert failed for ingredient ${ingredient.id} -> ${lang}`, error);
            }
          })
        );
      })
  );
}

export type SaveItemResult = { ok: true; id: string } | { ok: false; reason: string };

function isValidPrice(price: number): boolean {
  if (!Number.isFinite(price) || price < 0) {
    return false;
  }
  // At most 2 decimal places.
  return Math.round(price * 100) === price * 100;
}

export async function saveItem(input: SaveItemInput): Promise<SaveItemResult> {
  const name = input.name.trim();
  if (!name) {
    return { ok: false, reason: "empty-name" };
  }

  if (!input.categoryId) {
    return { ok: false, reason: "missing-category" };
  }

  if (!isValidPrice(input.price)) {
    return { ok: false, reason: "invalid-price" };
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

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("id", input.categoryId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!category) {
    return { ok: false, reason: "invalid-category" };
  }

  const description = input.description.trim();

  const baseFields = {
    name,
    category_id: input.categoryId,
    price: input.price,
    description: description || null,
    photo_url: input.photoUrl,
    is_displayed: input.isDisplayed,
    is_sold_out: input.isSoldOut,
    is_best_seller: input.isBestSeller,
  };

  let itemId: string;

  if (input.id) {
    const { data: existing } = await supabase
      .from("items")
      .select("description, ai_keywords, ai_generated_at")
      .eq("id", input.id)
      .eq("business_id", business.id)
      .maybeSingle();

    if (!existing) {
      return { ok: false, reason: "not-found" };
    }

    const descriptionChanged = (existing.description ?? "").trim() !== description;

    const provenanceFields = input.acceptedAiDraft
      ? {
          description_source: "ai_generated" as const,
          ai_keywords: input.acceptedAiDraft.keywords,
          ai_generated_at: new Date().toISOString(),
        }
      : descriptionChanged
        ? {
            description_source: "manual" as const,
            ai_keywords: existing.ai_keywords,
            ai_generated_at: existing.ai_generated_at,
          }
        : {};

    const { data, error } = await supabase
      .from("items")
      .update({ ...baseFields, ...provenanceFields })
      .eq("id", input.id)
      .eq("business_id", business.id)
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false, reason: error?.message ?? "update-failed" };
    }

    itemId = data.id;
  } else {
    const provenanceFields = input.acceptedAiDraft
      ? {
          description_source: "ai_generated" as const,
          ai_keywords: input.acceptedAiDraft.keywords,
          ai_generated_at: new Date().toISOString(),
        }
      : description
        ? { description_source: "manual" as const }
        : {};

    const { data: maxRow } = await supabase
      .from("items")
      .select("sort_order")
      .eq("category_id", input.categoryId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextSortOrder = maxRow ? maxRow.sort_order + 1 : 0;

    const { data, error } = await supabase
      .from("items")
      .insert({
        ...baseFields,
        ...provenanceFields,
        business_id: business.id,
        sort_order: nextSortOrder,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false, reason: error?.message ?? "insert-failed" };
    }

    itemId = data.id;
  }

  const resolvedIngredients = await reconcileItemIngredients(
    supabase,
    itemId,
    business.id,
    input.ingredients
  );

  await applyIngredientTranslations(supabase, business.id, resolvedIngredients, business.source_language);

  await applyItemDescriptionTranslations(
    supabase,
    itemId,
    business.id,
    description,
    business.source_language
  );

  return { ok: true, id: itemId };
}

export type DeleteItemResult = { ok: true } | { ok: false; reason: string };

export async function deleteItem(input: { id: string }): Promise<DeleteItemResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "not-authenticated" };
  }

  const business = await getOwnerBusiness(supabase, user.id);

  if (!business) {
    return { ok: false, reason: "no-business" };
  }

  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", input.id)
    .eq("business_id", business.id);

  if (error) {
    return { ok: false, reason: error.message };
  }

  return { ok: true };
}

export type UploadItemPhotoResult = { ok: true; photoUrl: string } | { ok: false; message: string };

export async function uploadItemPhoto(formData: FormData): Promise<UploadItemPhotoResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be signed in to upload a photo." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, message: "No file was received." };
  }

  const validationError = validateLogoFile(file);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  try {
    const secureUrl = await uploadImage(file, { folder: "items" });
    return { ok: true, photoUrl: secureUrl };
  } catch {
    return { ok: false, message: "The upload failed. Please try again." };
  }
}

export type GenerateItemDescriptionInput = {
  itemId?: string;
  name: string;
  keywords?: string;
};

export type GenerateItemDescriptionResult =
  | { ok: true; text: string }
  | { ok: false; reason: "limit-reached" }
  | { ok: false; reason: "generation-failed" };

export async function generateItemDescription(
  input: GenerateItemDescriptionInput
): Promise<GenerateItemDescriptionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "generation-failed" };
  }

  const business = await getOwnerBusiness(supabase, user.id);

  if (!business) {
    return { ok: false, reason: "generation-failed" };
  }

  if (input.itemId) {
    const { allowed } = await checkAndIncrementDailyLimit(supabase, input.itemId, business.id);
    if (!allowed) {
      return { ok: false, reason: "limit-reached" };
    }
  }

  const result = await generateDescription(input.name, input.keywords);

  if (!result.ok) {
    return { ok: false, reason: "generation-failed" };
  }

  return { ok: true, text: result.text };
}
