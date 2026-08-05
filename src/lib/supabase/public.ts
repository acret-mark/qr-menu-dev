import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-free Supabase client for the public menu read path.
 *
 * Unlike `src/lib/supabase/server.ts`'s `createClient()`, this never calls
 * `cookies()` — customers are never authenticated, and the RLS policies that
 * gate `businesses`/`categories`/`items`/`*_translations` for public reads
 * ("public can read active businesses", etc.) key off `businesses.status`,
 * never `auth.uid()`, so a session-less anon-key client returns identical
 * rows. Calling `cookies()` at all forces Next.js to treat a route as
 * dynamic and is disallowed inside `unstable_cache`'s callback — this client
 * exists so the public menu queries can be cached without either problem.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
