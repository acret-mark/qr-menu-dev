"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ItemPhotoUploader } from "@/components/items/item-photo-uploader";
import {
  ItemDescriptionField,
  type ItemDescriptionFieldHandle,
} from "@/components/items/item-description-field";
import { DeleteItemDialog } from "@/components/items/delete-item-dialog";
import { IngredientTagInput, type IngredientTag } from "@/components/items/ingredient-tag-input";
import { saveItem } from "@/lib/items/actions";
import type { CategoryOption, IngredientOption, ItemFormItem } from "@/lib/items/types";

export function ItemForm({
  categories,
  businessIngredients,
  item,
}: {
  categories: CategoryOption[];
  businessIngredients: IngredientOption[];
  item: ItemFormItem | null;
}) {
  const router = useRouter();
  const descriptionFieldRef = useRef<ItemDescriptionFieldHandle>(null);

  const [name, setName] = useState(item?.name ?? "");
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? categories[0]?.id ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [acceptedAiDraft, setAcceptedAiDraft] = useState<{ keywords: string[] } | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(item?.photoUrl ?? null);
  const [isDisplayed, setIsDisplayed] = useState(item?.isDisplayed ?? true);
  const [isSoldOut, setIsSoldOut] = useState(item?.isSoldOut ?? false);
  const [isBestSeller, setIsBestSeller] = useState(item?.isBestSeller ?? false);
  const [ingredients, setIngredients] = useState<IngredientTag[]>(
    item?.ingredients.map((ingredient) => ({ id: ingredient.id })) ?? []
  );

  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const priceValue = Number(price);
  const isPriceValid = price.trim() !== "" && Number.isFinite(priceValue) && priceValue >= 0;
  const canSubmit =
    name.trim() !== "" && categoryId !== "" && isPriceValid && !isPhotoUploading && !isSubmitting;

  function handleDescriptionChange(next: string) {
    setDescription(next);
    setAcceptedAiDraft(null);
  }

  function handleAcceptedDraft(keywords: string[]) {
    setAcceptedAiDraft({ keywords });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    const result = await saveItem({
      id: item?.id,
      name,
      categoryId,
      price: priceValue,
      description,
      photoUrl,
      isDisplayed,
      isSoldOut,
      isBestSeller,
      acceptedAiDraft: acceptedAiDraft ?? undefined,
      ingredients,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setError("Couldn't save. Please try again.");
      return;
    }

    router.push("/menu");
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 px-4">
        <div className="flex justify-center">
          <ItemPhotoUploader
            initialPhotoUrl={photoUrl}
            onPhotoChange={setPhotoUrl}
            onUploadStart={() => setIsPhotoUploading(true)}
            onUploadEnd={() => setIsPhotoUploading(false)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="item-name" className="text-sm font-medium">
            Item name
          </label>
          <input
            id="item-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => descriptionFieldRef.current?.triggerAutoDraft()}
            className="h-11 rounded-lg border border-border bg-background px-3.5 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="item-category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="item-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="h-11 rounded-lg border border-border bg-background px-3.5 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="item-price" className="text-sm font-medium">
            Price
          </label>
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5">
            <span className="text-muted-foreground">₱</span>
            <input
              id="item-price"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="h-11 w-full bg-transparent text-base outline-none"
            />
          </div>
        </div>

        <ItemDescriptionField
          ref={descriptionFieldRef}
          itemId={item?.id}
          name={name}
          initialDescription={item?.description ?? ""}
          initialDescriptionSource={item?.descriptionSource ?? null}
          initialKeywords={item?.aiKeywords ?? null}
          onDescriptionChange={handleDescriptionChange}
          onAcceptedDraft={handleAcceptedDraft}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="item-ingredients" className="text-sm font-medium">
            Ingredients
          </label>
          <IngredientTagInput
            id="item-ingredients"
            suggestions={businessIngredients}
            value={ingredients}
            onChange={setIngredients}
          />
        </div>

        <div className="mt-2 flex flex-col divide-y divide-border rounded-lg border border-border">
          <div className="flex items-center justify-between px-3.5 py-3">
            <span className="text-sm font-medium">Best Seller</span>
            <Switch checked={isBestSeller} onCheckedChange={setIsBestSeller} ariaLabel="Best Seller" />
          </div>
          <div className="flex items-center justify-between px-3.5 py-3">
            <span className="text-sm font-medium">Available</span>
            <Switch checked={!isSoldOut} onCheckedChange={(checked) => setIsSoldOut(!checked)} ariaLabel="Available" />
          </div>
          <div className="flex items-center justify-between px-3.5 py-3">
            <span className="text-sm font-medium">Show on Menu</span>
            <Switch checked={isDisplayed} onCheckedChange={setIsDisplayed} ariaLabel="Show on Menu" />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={!canSubmit} className="mt-2 h-11 w-full">
          {isSubmitting ? "Saving…" : "Save Item"}
        </Button>

        {item && (
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="mb-4 flex items-center justify-center gap-1.5 text-sm font-medium text-destructive"
          >
            <Trash2 size={16} />
            Delete Item
          </button>
        )}
      </form>

      {item && (
        <DeleteItemDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          itemId={item.id}
          itemName={item.name}
        />
      )}
    </>
  );
}
