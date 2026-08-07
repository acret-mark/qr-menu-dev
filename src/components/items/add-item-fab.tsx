import { Plus } from "lucide-react";
import { MaybeLink } from "@/components/dashboard/maybe-link";

export function AddItemFab() {
  return (
    <MaybeLink
      href="/dashboard/menu/new"
      enabled={true}
      className="fixed right-4 bottom-20 z-10 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
    >
      <Plus size={24} />
      <span className="sr-only">Add item</span>
    </MaybeLink>
  );
}
