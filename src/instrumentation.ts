/**
 * Refuses to let a local, non-Vercel process (a developer's own `next dev` or a local
 * `next build && next start`) finish starting up while connected to the PRODUCTION Supabase
 * project. Never blocks a real Vercel deployment — see the `VERCEL` check below.
 *
 * See specs/034-local-dev-environment/contracts/production-guard.md (ai_workspace) for the full
 * behavior contract this implements.
 */

// The production project's ref, captured once from the real .env.local. Not a secret — this
// value is already exposed to every browser tab via NEXT_PUBLIC_SUPABASE_URL.
const PRODUCTION_PROJECT_REF = "nnpuuolxaicfxooegohv";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Vercel sets this in every deployment it runs, production and preview alike — this guard
  // must never fire there, only on a developer's own machine.
  if (process.env.VERCEL) return;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const ref = url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];

  if (ref === PRODUCTION_PROJECT_REF) {
    throw new Error(
      "[production-guard] NEXT_PUBLIC_SUPABASE_URL resolves to the PRODUCTION Supabase " +
        "project. Refusing to start locally against it. Check that .env.development.local " +
        "exists and points at the local Supabase stack (`npm run db:start`, then " +
        "`npx supabase status` for the URL/keys). See README.md's Local Development section."
    );
  }
}
