"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { saveCategory } from "@/lib/categories/actions";

export function CategoryForm({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: { id: string; name: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(category?.name ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (next) {
      setName(category?.name ?? "");
      setError(null);
    }
    onOpenChange(next);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const result = await saveCategory({ id: category?.id, name });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(
        result.reason === "empty-name" ? "Name is required." : "Couldn't save. Please try again."
      );
      return;
    }

    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-4">
          <Dialog.Title className="font-heading text-lg font-semibold">
            {category ? "Edit category" : "Add category"}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3" noValidate>
            <label htmlFor="category-name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="h-11 rounded-lg border border-border bg-background px-3.5 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-invalid={!!error}
            />
            {error && <span className="text-xs text-destructive">{error}</span>}
            <div className="mt-2 flex justify-end gap-2">
              <Dialog.Close
                render={
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                }
              />
              <Button type="submit" disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
