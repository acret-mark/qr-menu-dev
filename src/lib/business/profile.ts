import type { SupabaseClient } from "@supabase/supabase-js";

export type BusinessProfile = {
  id: string;
  name: string;
  logoUrl: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
};

export type BusinessProfileUpdate = Partial<
  Pick<BusinessProfile, "name" | "contactPhone" | "contactEmail" | "address">
>;

export type UpdateBusinessProfileResult = { ok: true } | { ok: false; message: string };

const UPDATE_FAILED_MESSAGE = "Couldn't save your changes. Please try again.";

export async function getBusinessProfile(
  supabase: SupabaseClient,
  ownerId: string
): Promise<BusinessProfile | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, logo_url, contact_phone, contact_email, address")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    logoUrl: data.logo_url,
    contactPhone: data.contact_phone,
    contactEmail: data.contact_email,
    address: data.address,
  };
}

export async function updateBusinessProfile(
  supabase: SupabaseClient,
  businessId: string,
  updates: BusinessProfileUpdate
): Promise<UpdateBusinessProfileResult> {
  const { error } = await supabase
    .from("businesses")
    .update({
      name: updates.name,
      contact_phone: updates.contactPhone,
      contact_email: updates.contactEmail,
      address: updates.address,
    })
    .eq("id", businessId);

  if (error) {
    return { ok: false, message: UPDATE_FAILED_MESSAGE };
  }

  return { ok: true };
}
