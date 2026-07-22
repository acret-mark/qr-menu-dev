import { getBusinessBySlug, loadDisplayCategories } from "@/lib/menu/queries";
import { InactiveMenu } from "@/components/menu/inactive-menu";
import { SearchResults } from "@/components/menu/search-results";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    return (
      <div className="mx-auto w-full flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <InactiveMenu slug={slug} />
        </div>
      </div>
    );
  }

  const { sourceCategories, initialLanguage, initialCategories, needsClientProbe } =
    await loadDisplayCategories(business);

  return (
    <div className="mx-auto w-full flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <SearchResults
        business={business}
        sourceCategories={sourceCategories}
        initialLanguage={initialLanguage}
        initialCategories={initialCategories}
        needsClientProbe={needsClientProbe}
        initialQuery={q ?? ""}
      />
    </div>
  );
}
