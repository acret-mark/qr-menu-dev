import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS entirely by design.
 *
 * First use of the service role anywhere in this repo. This exists
 * specifically for scheduled cron routes, which run with no authenticated
 * user/cookie session for @supabase/ssr's createServerClient to read — there
 * is no request to key RLS off of.
 *
 * Import boundary: only ever import this from
 * src/app/api/cron/payment-reminders/route.ts (and, transitively,
 * src/lib/subscription/reminders.ts) or
 * src/app/api/cron/subscription-expiry/route.ts
 * (specs/032-unified-subscription-lifecycle, same cross-tenant-scan
 * justification) — never from a "use client" file, a page component, or any
 * owner/admin-authenticated Server Action.
 */
export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}
