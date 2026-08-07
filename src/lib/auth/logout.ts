"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LOGIN_PATH } from "@/lib/auth/login";

// Scoped to what the account-suspended screen needs (end the session, return
// to login) — not a shared, app-wide logout affordance. No arguments, no
// `{ ok, message }` return shape: signing out has no user-correctable
// failure worth surfacing as a form error.
export async function signOutOwner(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(LOGIN_PATH);
}
