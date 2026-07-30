"use client";

import { useState } from "react";
import { ImageOff, Receipt } from "lucide-react";

/**
 * 32px payment-proof preview for the Payment Queue (A-04), linking to the
 * full-size image in a new tab.
 *
 * Three states: a normal thumbnail, "no proof submitted" when the owner never
 * uploaded one (the row still lists — that's exactly what an admin needs to
 * notice), and a fallback when the URL is present but the image won't load.
 *
 * Plain <img> rather than next/image: next.config.ts declares no
 * images.remotePatterns, so next/image would fail at runtime on Cloudinary URLs.
 * Matches the existing customer-menu components.
 */
export function PaymentProofThumb({
  url,
  businessName,
}: {
  url: string | null;
  businessName: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!url || hasError) {
    const label = url
      ? `Payment proof for ${businessName} could not be loaded`
      : `No payment proof submitted for ${businessName}`;
    const Icon = url ? ImageOff : Receipt;

    return (
      <div
        role="img"
        aria-label={label}
        title={label}
        className="flex size-8 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground"
      >
        <Icon className="size-3.5" aria-hidden />
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="block size-8 overflow-hidden rounded-md border border-border"
      title={`View full-size payment proof for ${businessName}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`Payment proof submitted by ${businessName}`}
        className="size-full object-cover"
        onError={() => setHasError(true)}
      />
    </a>
  );
}
