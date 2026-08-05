"use server";

import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@/lib/supabase/server";
import { getBusinessProfile } from "@/lib/business/profile";
import { validateLogoFile } from "@/lib/business/logo-validation";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "business-logos",
      quality: "auto",
      fetch_format: "auto",
    });

    secureUrl = result.secure_url;
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
