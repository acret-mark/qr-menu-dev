"use client";

import { useState } from "react";
import { LogoUploader } from "@/components/business/logo-uploader";
import { ProfileForm } from "@/components/business/profile-form";
import type { BusinessProfile } from "@/lib/business/profile";

export function BusinessProfilePanel({ initialProfile }: { initialProfile: BusinessProfile }) {
  const [isLogoUploading, setIsLogoUploading] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <LogoUploader
        initialLogoUrl={initialProfile.logoUrl}
        onUploadStart={() => setIsLogoUploading(true)}
        onUploadEnd={() => setIsLogoUploading(false)}
      />
      <ProfileForm initialProfile={initialProfile} saveDisabled={isLogoUploading} />
    </div>
  );
}
