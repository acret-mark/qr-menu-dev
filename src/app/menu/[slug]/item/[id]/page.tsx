import { notFound } from "next/navigation";
import { getBusinessBySlug, getItemDetail } from "@/lib/menu/queries";
import { InactiveMenu } from "@/components/menu/inactive-menu";
import { ItemDetail } from "@/components/menu/item-detail";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
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

  const item = await getItemDetail(business.id, id);
  if (!item) notFound();

  return (
    <div className="mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <ItemDetail business={business} item={item} />
    </div>
  );
}
