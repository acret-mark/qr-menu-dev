"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteCategory } from "@/lib/categories/actions";
import type { OwnerCategory } from "@/lib/categories/types";

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: OwnerCategory;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsDeleting(true);
    setError(null);
    const result = await deleteCategory({ id: category.id });
    setIsDeleting(false);

    if (!result.ok) {
      setError("Couldn't delete. Please try again.");
      return;
    }

    onOpenChange(false);
    router.refresh();
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 bg-black/50" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-4">
          <AlertDialog.Title className="font-heading text-lg font-semibold">
            {category.itemCount > 0 ? "Delete category and its items?" : "Delete this category?"}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            {category.itemCount > 0
              ? `Delete "${category.name}" and its ${category.itemCount} item${category.itemCount === 1 ? "" : "s"}? This can't be undone.`
              : `Delete "${category.name}"? This can't be undone.`}
          </AlertDialog.Description>
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <AlertDialog.Close
              render={
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              }
            />
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
