"use client";

import { useState } from "react";
import { Pencil, Trash2, TriangleAlert } from "lucide-react";
import type { OwnerCategory } from "@/lib/categories/types";
import { CategoryForm } from "@/components/categories/category-form";
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog";
import { ReorderControls } from "@/components/categories/reorder-controls";

export function CategoryList({ categories }: { categories: OwnerCategory[] }) {
  const [editing, setEditing] = useState<OwnerCategory | null>(null);
  const [deleting, setDeleting] = useState<OwnerCategory | null>(null);

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
              categoryId={category.id}
              isFirst={index === 0}
              isLast={index === categories.length - 1}
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
