import Image from "next/image";
import { ImageOff, Star } from "lucide-react";
import { cloudinaryLoader } from "@/lib/images/cloudinary";
import { cn } from "@/lib/utils";
import { ItemAccordionBody } from "./item-accordion-body";
import type { MenuItem } from "@/lib/menu/types";

export function ItemCard({
  item,
  categoryName,
  isExpanded,
  onToggle,
}: {
  item: MenuItem;
  categoryName: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-3",
        item.isSoldOut && "opacity-60"
      )}
    >
      <button type="button" onClick={onToggle} className="flex w-full gap-3 text-left">
        <div
          className={cn(
            "relative flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-chart-2 text-primary-foreground/80",
            item.isSoldOut && "grayscale-[70%]"
          )}
        >
          {item.isBestSeller && (
            <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-accent px-1 py-0.5 text-accent-foreground">
              <Star size={10} fill="currentColor" strokeWidth={0} />
            </span>
          )}
          {item.photoUrl ? (
            <Image
              loader={cloudinaryLoader}
              src={item.photoUrl}
              alt=""
              fill
              sizes="76px"
              className="object-cover"
            />
          ) : (
            <ImageOff size={30} strokeWidth={1.5} className="opacity-85" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-[0.98rem] font-semibold">
            {item.name}
            {item.isSoldOut && (
              <span className="inline-flex items-center rounded-full bg-muted-foreground px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-card">
                Sold Out
              </span>
            )}
          </div>
          {item.description && (
            <div className="line-clamp-2 text-[0.83rem] text-muted-foreground">
              {item.description}
            </div>
          )}
          <div className="mt-auto font-semibold tabular-nums">
            ₱{item.price.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
        </div>
      </button>
      {isExpanded && <ItemAccordionBody item={item} categoryName={categoryName} />}
    </div>
  );
}
