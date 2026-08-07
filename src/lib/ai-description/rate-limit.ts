import type { SupabaseClient } from "@supabase/supabase-js";

const DAILY_LIMIT = Number(process.env.AI_DESCRIPTION_DAILY_LIMIT ?? 10);

// Error codes seen while the proposed item_description_generations table
// (data-model.md) hasn't been migrated yet: "42P01" is Postgres's own
// "relation does not exist"; "PGRST205" is what PostgREST (this project's
// Supabase client goes through PostgREST, not a raw pg connection) returns
// when a table is missing from its schema cache — confirmed empirically
// against the current dev database, which doesn't have this table yet.
const UNDEFINED_TABLE_CODES = new Set(["42P01", "PGRST205"]);

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Counts and caps description-generation attempts per item per day
 * (FR-017). Fails open — allows the attempt and logs a warning — if the
 * backing table doesn't exist yet, so the rest of the AI description flow
 * stays fully functional ahead of that migration landing (research.md §2).
 */
export async function checkAndIncrementDailyLimit(
  supabase: SupabaseClient,
  itemId: string,
  businessId: string
): Promise<{ allowed: boolean }> {
  const generatedOn = todayDateString();

  const { data: existing, error: selectError } = await supabase
    .from("item_description_generations")
    .select("id, attempt_count")
    .eq("item_id", itemId)
    .eq("generated_on", generatedOn)
    .maybeSingle();

  if (selectError) {
    if (UNDEFINED_TABLE_CODES.has(selectError.code)) {
      console.warn(
        "checkAndIncrementDailyLimit: item_description_generations table doesn't exist yet " +
          "(proposed schema not migrated, data-model.md) — failing open per research.md §2; " +
          "every generation attempt is currently allowed and uncapped."
      );
      return { allowed: true };
    }
    console.error("checkAndIncrementDailyLimit: select failed", selectError);
    return { allowed: true };
  }

  if (existing && existing.attempt_count >= DAILY_LIMIT) {
    return { allowed: false };
  }

  if (existing) {
    await supabase
      .from("item_description_generations")
      .update({ attempt_count: existing.attempt_count + 1 })
      .eq("id", existing.id);
  } else {
    await supabase.from("item_description_generations").insert({
      item_id: itemId,
      business_id: businessId,
      generated_on: generatedOn,
      attempt_count: 1,
    });
  }

  return { allowed: true };
}
