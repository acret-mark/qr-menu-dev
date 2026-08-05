"use server";

import { createClient } from "@/lib/supabase/server";
import { getBusinessProfile } from "@/lib/business/profile";
import { validateLogoFile } from "@/lib/business/logo-validation";
import { uploadImage } from "@/lib/cloudinary/client";

export type UploadLogoResult = { ok: true; logoUrl: string } | { ok: false; message: string };

export async function uploadBusinessLogo(formData: FormData): Promise<UploadLogoResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be signed in to upload a logo." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, message: "No file was received." };
  }

  const validationError = validateLogoFile(file);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const profile = await getBusinessProfile(supabase, user.id);
  if (!profile) {
    return { ok: false, message: "Couldn't find your business. Please try again." };
  }

  let secureUrl: string;
  try {
    secureUrl = await uploadImage(file, { folder: "business-logos" });
  } catch {
    return { ok: false, message: "The upload failed. Please try again." };
  }

  const { error: updateError } = await supabase
    .from("businesses")
    .update({ logo_url: secureUrl })
    .eq("id", profile.id);

  if (updateError) {
    return { ok: false, message: "The logo uploaded, but we couldn't save it. Please try again." };
  }

  return { ok: true, logoUrl: secureUrl };
}
