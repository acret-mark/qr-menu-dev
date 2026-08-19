import type { SupabaseClient } from "@supabase/supabase-js";

export type LoginOwnerInput = {
  email: string;
  password: string;
};

export type LoginOwnerResult =
  | { ok: true }
  | { ok: false; reason: "invalid-credentials"; message: string }
  | { ok: false; reason: "unconfirmed-email"; message: string };

export type BusinessStatus = "pending" | "trial" | "active" | "suspended";

export type OwnerBusiness = {
  id: string;
  status: BusinessStatus;
  name: string;
};

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";
const UNCONFIRMED_EMAIL_MESSAGE = "Please confirm your email before signing in.";

export const LOGIN_PATH = "/login";
export const DASHBOARD_PATH = "/dashboard";
export const FORGOT_PASSWORD_PATH = "/forgot-password";
export const SUSPENDED_PATH = "/account-suspended";
export const ERROR_PATH = "/error";

const KNOWN_BUSINESS_STATUSES: readonly BusinessStatus[] = [
  "pending",
  "trial",
  "active",
  "suspended",
];

export function isKnownBusinessStatus(status: string): status is BusinessStatus {
  return (KNOWN_BUSINESS_STATUSES as readonly string[]).includes(status);
}

export async function loginOwner(
  supabase: SupabaseClient,
  { email, password }: LoginOwnerInput
): Promise<LoginOwnerResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (!error) {
    return { ok: true };
  }

  const isUnconfirmedEmail =
    error.code === "email_not_confirmed" || /email.*not.*confirmed/i.test(error.message);

  if (isUnconfirmedEmail) {
    return { ok: false, reason: "unconfirmed-email", message: UNCONFIRMED_EMAIL_MESSAGE };
  }

  return { ok: false, reason: "invalid-credentials", message: INVALID_CREDENTIALS_MESSAGE };
}

export async function getOwnerBusiness(
  supabase: SupabaseClient,
  ownerId: string
): Promise<OwnerBusiness | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, status, name")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as OwnerBusiness;
}
