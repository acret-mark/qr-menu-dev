import { getBusinessBySlug, loadDisplayCategories } from "@/lib/menu/queries";
import { InactiveMenu } from "@/components/menu/inactive-menu";
import { MenuHome } from "@/components/menu/menu-home";

export default async function MenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { slug } = await params;
  const { cat } = await searchParams;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    return (
      <div className="mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <InactiveMenu slug={slug} />
        </div>
      </div>
    );
  }

  const { sourceCategories, initialLanguage, initialCategories, needsClientProbe } =
    await loadDisplayCategories(business);

  return (
    <div className="mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <MenuHome
        business={business}
        sourceCategories={sourceCategories}
        initialLanguage={initialLanguage}
        initialCategories={initialCategories}
        needsClientProbe={needsClientProbe}
        initialActiveCategoryId={cat}
      />
    </div>
  );
}
