"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { deleteItem } from "@/lib/items/actions";

export function DeleteItemDialog({
  open,
  onOpenChange,
  itemId,
  itemName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemName: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsDeleting(true);
    setError(null);
    const result = await deleteItem({ id: itemId });
    setIsDeleting(false);

    if (!result.ok) {
      setError("Couldn't delete. Please try again.");
      return;
    }

    router.push("/menu");
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-4">
          <Dialog.Title className="font-heading text-lg font-semibold">Delete this item?</Dialog.Title>
          <p className="mt-2 text-sm text-muted-foreground">
            Delete &ldquo;{itemName}&rdquo;? This can&rsquo;t be undone.
          </p>
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <Dialog.Close
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
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
