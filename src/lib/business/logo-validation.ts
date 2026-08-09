export const ALLOWED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];
// Capped at 4MB, not Vercel's true 4.5MB Serverless Function body ceiling,
// to leave headroom for multipart overhead — see next.config.ts.
export const MAX_LOGO_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

/**
 * Shared by both the client-side check (logo-uploader.tsx) and the server
 * Server Action's defense-in-depth check (actions.ts) — one source of truth
 * so the two can't silently drift apart.
 */
export function validateLogoFile(file: { type: string; size: number }): string | null {
  if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
    return "Please upload a JPEG, PNG, or WebP image.";
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return "That image is too large — please use one under 4MB.";
  }

  return null;
}
