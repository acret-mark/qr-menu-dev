"use server";

import { invalidateMenuCache } from "./cache";

/**
 * Server Action wrapper around `invalidateMenuCache`, for write paths that
 * run in the browser (e.g. `updateBusinessProfile`, called directly from a
 * `"use client"` form with the browser Supabase client) and therefore can't
 * import `revalidateTag`/`invalidateMenuCache` themselves.
 */
export async function invalidateMenuCacheAction(slug: string): Promise<void> {
  invalidateMenuCache(slug);
}
