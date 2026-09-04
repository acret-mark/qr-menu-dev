import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Error pages are functional-only and never meant to surface in search
// results (specs/033 FR-009).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Dev-only verification aid for S-04 (spec.md US2/FR-007) — throws for real,
// so visiting this route in development exercises the actual
// throw → nearest error.tsx boundary → ErrorState pipeline, not just a
// re-render of /error's static content. Gated out of production with the
// same notFound() convention already used elsewhere in this codebase (e.g.
// src/app/admin/(protected)/businesses/[id]/page.tsx), so it adds no
// production-reachable surface beyond what the spec calls for.
export default function ForceErrorTestPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  throw new Error("Forced error for S-04 dev verification");
}
