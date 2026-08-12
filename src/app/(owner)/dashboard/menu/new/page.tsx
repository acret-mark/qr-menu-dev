import { getCurrentUser } from "@/lib/supabase/server";
import { getItemFormData } from "@/lib/items/queries";
import { ItemForm } from "@/components/items/item-form";
import { MaybeLink } from "@/components/dashboard/maybe-link";

export default async function NewItemPage() {
  const { supabase, user } = await getCurrentUser();

  // The (owner) layout already guarantees a signed-in user with a valid
  // business row before this page renders.
  const { categories } = await getItemFormData(supabase, user!.id);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-xl font-semibold">Add Item</h1>
        <p className="px-4 py-8 text-center text-base text-muted-foreground">
          No categories yet.{" "}
          <MaybeLink href="/categories" enabled={true} className="text-primary underline">
            Create a category
          </MaybeLink>{" "}
          before adding items.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-xl font-semibold">Add Item</h1>
      <ItemForm categories={categories} item={null} />
    </div>
  );
}
