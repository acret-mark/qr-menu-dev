import type { SupabaseClient } from "@supabase/supabase-js";

export type LoginAdminInput = {
  email: string;
  password: string;
};

export type LoginAdminResult = { ok: true } | { ok: false; message: string };

const GENERIC_LOGIN_ERROR = "Invalid email or password.";

export async function loginAdmin(
  supabase: SupabaseClient,
  { email, password }: LoginAdminInput
): Promise<LoginAdminResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, message: GENERIC_LOGIN_ERROR };
  }

  return { ok: true };
}

export async function requireAdmin(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin");

  if (error) {
    return false;
  }

  return data === true;
}
