import { updateTag } from "next/cache";

/**
 * Tag naming convention for a business's cached public-menu content
 * (business info, categories, items, translations, item detail — all of it,
 * across every function in `queries.ts`). Defined once here so callers never
 * duplicate the format.
 */
export function menuCacheTag(slug: string): string {
  return `menu:${slug}`;
}

/**
 * Invalidates every cached public-menu read for one business, by slug —
 * immediately, so the next request gets fresh data rather than one more
 * stale read (per spec.md's resolved Clarification: "near-immediate for
 * everything", not stale-while-revalidate).
 *
 * Server-only, and — per Next.js 16 — only callable from within a Server
 * Action (not a Route Handler or plain Server Component; `updateTag`'s
 * sibling `revalidateTag` covers those contexts, but always serves one more
 * stale read first via `profile="max"`, which this feature's freshness
 * target rules out). Every current caller (`uploadBusinessLogo`,
 * `invalidateMenuCacheAction`, `activateSubscription`) is itself a Server
 * Action. Callers invoked from client components must go through
 * `invalidateMenuCacheAction` (`cache-actions.ts`) instead of importing this
 * directly.
 */
export function invalidateMenuCache(slug: string): void {
  updateTag(menuCacheTag(slug));
}
