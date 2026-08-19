"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LOGIN_PATH } from "@/lib/auth/login";

const ADMIN_LOGIN_PATH = "/admin/login";

// signOutOwner was originally scoped to just the account-suspended screen's
// "Log out" control (022-trial-expired-suspended) — that feature's own
// research.md deliberately rejected making it "a shared, app-wide logout
// affordance... scope creep beyond this screen" at the time, since the owner
// tab bar had no persistent nav chrome to host one. It now also backs the
// owner dashboard shell's own logout button (owner-shell.tsx), per an
// explicit later request — the underlying action (sign out, return to
// owner login) is identical either way, so it's reused as named rather than
// duplicated. No arguments, no `{ ok, message }` return shape: signing out
// has no user-correctable failure worth surfacing as a form error.
export async function signOutOwner(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(LOGIN_PATH);
}

// Same mechanism as signOutOwner, redirecting to the admin login instead —
// admin and owner sessions are both plain Supabase Auth sessions (admin
// status is a separate is_admin check on top, not a different auth system),
// so signing out is identical; only the post-logout destination differs.
export async function signOutAdmin(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ADMIN_LOGIN_PATH);
}
