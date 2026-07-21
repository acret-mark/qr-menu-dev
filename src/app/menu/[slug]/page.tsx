import { getBusinessBySlug, getMenuData, getTranslations } from "@/lib/menu/queries";
import { applyTranslations } from "@/lib/menu/translations";
import { getInitialDisplayLanguage } from "@/lib/menu/language";
import { InactiveMenu } from "@/components/menu/inactive-menu";
import { MenuHome } from "@/components/menu/menu-home";
import type { DisplayLanguage } from "@/lib/menu/types";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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

  const sourceCategories = await getMenuData(business.id);

  let initialLanguage: DisplayLanguage = "en";
  let initialCategories = sourceCategories;

  if (business.plan === "pro") {
    initialLanguage = await getInitialDisplayLanguage();
    if (initialLanguage !== business.sourceLanguage) {
      const translations = await getTranslations(business.id, initialLanguage);
      initialCategories = applyTranslations(sourceCategories, translations);
    }
  }

  return (
    <div className="mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <MenuHome
        business={business}
        sourceCategories={sourceCategories}
        initialLanguage={initialLanguage}
        initialCategories={initialCategories}
      />
    </div>
  );
}
