import { notFound } from "next/navigation";
import { getBusinessBySlug, getItemDetail, getTranslations } from "@/lib/menu/queries";
import { getInitialDisplayLanguage } from "@/lib/menu/language";
import { InactiveMenuScreen } from "@/components/menu/inactive-menu-screen";
import { ItemDetail } from "@/components/menu/item-detail";
import type { DisplayLanguage } from "@/lib/menu/types";

export default async function ItemDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug, id } = await params;
  const { q } = await searchParams;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    return <InactiveMenuScreen slug={slug} />;
  }

  const item = await getItemDetail(business.id, id, business.slug);
  if (!item) notFound();

  let initialLanguage: DisplayLanguage = "en";
  let initialDescription = item.description;

  if (business.plan === "pro") {
    const resolved = await getInitialDisplayLanguage(business.sourceLanguage);
    initialLanguage = resolved.language;
    if (!resolved.skipTranslation && initialLanguage !== business.sourceLanguage) {
      const translations = await getTranslations(business.id, initialLanguage, business.slug);
      initialDescription = translations.itemDescriptions[item.id] ?? item.description;
    }
  }

  return (
    <div className="mx-auto w-full flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <ItemDetail
        business={business}
        item={item}
        initialLanguage={initialLanguage}
        initialDescription={initialDescription}
        fromSearchQuery={q}
      />
    </div>
  );
}
