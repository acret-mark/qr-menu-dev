import { createClient } from "@/lib/supabase/server";
import { getItemFormData } from "@/lib/items/queries";
import { ItemForm } from "@/components/items/item-form";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The (owner) layout already guarantees a signed-in user with a valid
  // business row before this page renders.
  const { categories, item } = await getItemFormData(supabase, user!.id, id);

  if (!item) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-xl font-semibold">Edit Item</h1>
        <p className="px-4 py-8 text-center text-base text-muted-foreground">
          That item couldn&rsquo;t be found.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-xl font-semibold">Edit Item</h1>
      <ItemForm categories={categories} item={item} />
    </div>
  );
}
