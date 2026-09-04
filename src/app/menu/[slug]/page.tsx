import type { Metadata } from "next";
import { getBusinessBySlug, loadDisplayCategories } from "@/lib/menu/queries";
import { InactiveMenuScreen } from "@/components/menu/inactive-menu-screen";
import { MenuHome } from "@/components/menu/menu-home";

// Public menu pages are reached only by scanning a physical QR code, never by
// search — indexing them offers no value and risks thin/duplicate-content
// problems at scale, so every one carries a noindex directive regardless of
// robots.txt (specs/033 FR-006). No per-business title/description is added
// here — that would have no SEO payoff for a page that stays excluded.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function MenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cat?: string; q?: string; item?: string }>;
}) {
  const { slug } = await params;
  const { cat, q, item } = await searchParams;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    return <InactiveMenuScreen slug={slug} />;
  }

  const { sourceCategories, initialLanguage, initialCategories, needsClientProbe } =
    await loadDisplayCategories(business);

  return (
    // `relative` is load-bearing: ItemDetailSheet renders `position: absolute`
    // (not `fixed`) precisely so it stays scoped to this mobile-width frame
    // instead of spanning the full desktop viewport — the app is mobile-first
    // "even viewed in desktop" (a centered phone-width column, not a
    // full-bleed layout), and its modal should behave the same way.
    <div className="relative mx-auto w-full flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <MenuHome
        business={business}
        sourceCategories={sourceCategories}
        initialLanguage={initialLanguage}
        initialCategories={initialCategories}
        needsClientProbe={needsClientProbe}
        initialCategoryIndex={cat}
        initialQuery={q}
        initialItemIndex={item}
      />
    </div>
  );
}
