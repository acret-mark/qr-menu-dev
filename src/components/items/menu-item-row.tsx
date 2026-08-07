"use client";

import { Image as ImageIcon, Pencil, Star, TriangleAlert } from "lucide-react";
import { MaybeLink } from "@/components/dashboard/maybe-link";
import { Switch } from "@/components/ui/switch";
import type { OwnerMenuItem } from "@/lib/items/types";

export function MenuItemRow({
  item,
  error,
  onToggle,
}: {
  item: OwnerMenuItem;
  error?: string;
  onToggle: (item: OwnerMenuItem) => void;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <ImageIcon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-base font-medium">
          <span className="truncate">{item.name}</span>
          {item.isBestSeller && (
            <span
              className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-primary"
              title="Best seller"
            >
              <Star size={10} className="fill-current" />
            </span>
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          ₱
          {item.price.toLocaleString("en-PH", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </p>
        {error && <p className="mt-0.5 text-xs text-destructive">{error}</p>}
        {item.hasStaleTranslation && (
          <p
            className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"
            title="A translation for this item hasn't completed yet — it will retry on the next save."
          >
            <TriangleAlert size={12} />
            Translation pending
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1">
        <span className="text-xs text-muted-foreground">Available</span>
        <Switch
          checked={!item.isSoldOut}
          onCheckedChange={() => onToggle(item)}
          ariaLabel={
            item.isSoldOut ? "Sold out — tap to mark available" : "Available — tap to mark sold out"
          }
        />
      </div>
      <MaybeLink
        href={`/dashboard/menu/${item.id}/edit`}
        enabled={true}
        className="flex size-9 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Pencil size={16} />
        <span className="text-[0.65rem]">Edit</span>
        <span className="sr-only">Edit {item.name}</span>
      </MaybeLink>
    </li>
  );
}
