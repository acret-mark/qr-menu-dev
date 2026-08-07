"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { uploadItemPhoto } from "@/lib/items/actions";
import { cloudinaryLoader } from "@/lib/images/cloudinary";
import { validateLogoFile } from "@/lib/business/logo-validation";

export function ItemPhotoUploader({
  initialPhotoUrl,
  onPhotoChange,
  onUploadStart,
  onUploadEnd,
}: {
  initialPhotoUrl: string | null;
  onPhotoChange: (photoUrl: string) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
}) {
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);

    const validationError = validateLogoFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData();
    formData.set("file", file);

    setUploading(true);
    onUploadStart();
    try {
      const result = await uploadItemPhoto(formData);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setPhotoUrl(result.photoUrl);
      onPhotoChange(result.photoUrl);
    } finally {
      setUploading(false);
      onUploadEnd();
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted text-muted-foreground"
        aria-label="Change item photo"
      >
        {photoUrl ? (
          <Image
            loader={cloudinaryLoader}
            src={photoUrl}
            alt="Item photo"
            fill
            className="object-cover"
          />
        ) : (
          <Camera size={24} />
        )}
      </button>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs font-medium text-accent disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "Tap to change photo"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
