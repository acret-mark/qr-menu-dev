import type { SupabaseClient } from "@supabase/supabase-js";

export interface BusinessForQr {
  name: string;
  slug: string;
}

export async function getBusinessForQr(
  supabase: SupabaseClient,
  ownerId: string
): Promise<BusinessForQr | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select("name, slug")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return { name: data.name, slug: data.slug };
}
