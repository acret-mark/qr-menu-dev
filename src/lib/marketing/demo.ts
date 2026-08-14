/**
 * The one place the seeded demo business's slug is defined (spec FR-008).
 *
 * ⚠️ PLACEHOLDER VALUE — no business exists at this slug yet. Per
 * specs/025-marketing-homepage/tasks.md T006, a real business must be
 * registered through the normal owner-registration + admin-activation flow
 * (ideally on the Pro tier, with at least one category and a few items) and
 * this constant updated to its real slug before `/demo` shows real content.
 * Until then, `/demo` falls through to whatever `/menu/[slug]` already
 * renders for a nonexistent/inactive slug — expected, not a bug.
 */
export const DEMO_BUSINESS_SLUG = "hapag-demo";
