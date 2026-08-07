"use server";

import { createClient } from "@/lib/supabase/server";
import { getOwnerBusiness } from "@/lib/auth/login";

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
