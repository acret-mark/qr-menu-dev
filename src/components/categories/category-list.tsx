"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, TriangleAlert } from "lucide-react";
import type { OwnerCategory } from "@/lib/categories/types";
import { CategoryForm } from "@/components/categories/category-form";
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog";
import { ReorderControls } from "@/components/categories/reorder-controls";
import { reorderCategory } from "@/lib/categories/actions";

export function CategoryList({ categories }: { categories: OwnerCategory[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<OwnerCategory | null>(null);
  const [deleting, setDeleting] = useState<OwnerCategory | null>(null);
  // Reordering has two phases, each with its own "is this actually done"
  // signal: (1) the reorderCategory round trip, tracked with plain state
  // since we control its start/end directly, and (2) applying the refreshed
  // list, tracked by wrapping router.refresh() — and *only* router.refresh(),
  // as its own synchronous startTransition callback (the pattern Next.js's
  // router actually keys its pending-navigation tracking off of). Wrapping
  // it inside a larger async callback that also awaits the server action
  // first (an earlier attempt at this) does NOT work: that callback's own
  // promise resolves right after calling refresh(), not when the refreshed
  // RSC tree commits, since router.refresh() itself returns void rather than
  // a promise tied to that commit.
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [isRefreshing, startTransition] = useTransition();

  async function handleMove(categoryId: string, direction: "up" | "down") {
    if (pendingId || isRefreshing) return;
    setPendingId(categoryId);
    await reorderCategory({ id: categoryId, direction });
    setPendingId(null);
    setRefreshingId(categoryId);
    startTransition(() => {
      router.refresh();
    });
  }

  const movingId = pendingId ?? (isRefreshing ? refreshingId : null);
  const isBusy = pendingId !== null || isRefreshing;

  if (categories.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-base text-muted-foreground">No categories yet.</p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {categories.map((category, index) => (
          <li key={category.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <ReorderControls
              isFirst={index === 0}
              isLast={index === categories.length - 1}
              isMoving={movingId === category.id}
              disabled={isBusy}
              onMove={(direction) => handleMove(category.id, direction)}
            />
            <div className="flex-1">
              <p className="text-base font-medium">{category.name}</p>
              <p className="text-sm text-muted-foreground">
                {category.itemCount} item{category.itemCount === 1 ? "" : "s"}
              </p>
              {category.hasStaleTranslation && (
                <p
                  className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"
                  title="A translation for this category hasn't completed yet — it will retry on the next save."
                >
                  <TriangleAlert size={12} />
                  Translation pending
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={`Edit ${category.name}`}
                onClick={() => setEditing(category)}
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                aria-label={`Delete ${category.name}`}
                onClick={() => setDeleting(category)}
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <CategoryForm
          open={true}
          onOpenChange={(open) => !open && setEditing(null)}
          category={editing}
        />
      )}

      {deleting && (
        <DeleteCategoryDialog
          open={true}
          onOpenChange={(open) => !open && setDeleting(null)}
          category={deleting}
        />
      )}
    </>
  );
}
