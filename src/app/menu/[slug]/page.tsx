import { getBusinessBySlug, loadDisplayCategories } from "@/lib/menu/queries";
import { InactiveMenuScreen } from "@/components/menu/inactive-menu-screen";
import { MenuHome } from "@/components/menu/menu-home";

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
    <div className="mx-auto w-full flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <MenuHome
        business={business}
        sourceCategories={sourceCategories}
        initialLanguage={initialLanguage}
        initialCategories={initialCategories}
        needsClientProbe={needsClientProbe}
        initialActiveCategoryId={cat}
        initialQuery={q}
        initialItemId={item}
      />
    </div>
  );
}
