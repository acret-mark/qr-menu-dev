import type { SupabaseClient } from "@supabase/supabase-js";
import { randomSlug, slugify } from "./slug";

const MAX_SLUG_ATTEMPTS = 25;

export type RegisterOwnerInput = {
  businessName: string;
  email: string;
  password: string;
};

export type RegisterOwnerResult =
  | { ok: true }
  | { ok: false; stage: "duplicate-email" | "auth" | "business"; message: string };

const BUSINESS_SETUP_FAILED_MESSAGE =
  "Your account was created, but we couldn't finish setting up your business. Please contact support.";

export async function registerOwner(
  supabase: SupabaseClient,
  { businessName, email, password }: RegisterOwnerInput
): Promise<RegisterOwnerResult> {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    if (/already registered|already exists/i.test(signUpError.message)) {
      return {
        ok: false,
        stage: "duplicate-email",
        message: "An account with this email already exists.",
      };
    }
    return { ok: false, stage: "auth", message: signUpError.message };
  }

  // Supabase signs up an "existing" user with an empty identities array
  // (no error) when email-enumeration protection is on, instead of
  // reporting a conflict directly.
  if (signUpData.user && signUpData.user.identities?.length === 0) {
    return {
      ok: false,
      stage: "duplicate-email",
      message: "An account with this email already exists.",
    };
  }

  const ownerId = signUpData.user?.id;
  if (!ownerId) {
    return { ok: false, stage: "auth", message: "Could not create your account. Please try again." };
  }

  const baseSlug = slugify(businessName) || randomSlug();
  let candidate = baseSlug;
  let suffix = 1;

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const { error: insertError } = await supabase.from("businesses").insert({
      name: businessName,
      slug: candidate,
      owner_id: ownerId,
      status: "pending",
      plan: "standard",
    });

    if (!insertError) return { ok: true };

    if (insertError.code === "23505") {
      suffix += 1;
      candidate = `${baseSlug}-${suffix}`;
      continue;
    }

    console.error("Failed to create business row for new owner", ownerId, insertError);
    return { ok: false, stage: "business", message: BUSINESS_SETUP_FAILED_MESSAGE };
  }

  console.error("Exhausted slug attempts for new owner", ownerId, businessName);
  return { ok: false, stage: "business", message: BUSINESS_SETUP_FAILED_MESSAGE };
}
