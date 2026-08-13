import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cloudinaryLoader } from "@/lib/images/cloudinary";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/lib/menu/types";

// Extracted expanded-detail markup, formerly item-detail.tsx's standalone
// page body. The collapsed ItemCard row directly above this is always
// visible at the same time (unlike the old standalone screen it replaced),
// and already shows the item's name, price, and sold-out/best-seller
// status — so this accordion is deliberately additive-only: an enlarged
// photo, the full untruncated description, and the item's category (none
// of which the row shows) — nothing the row repeats (spec.md
// FR-002e/FR-002f, research.md §4). Also drops the page-level back button
// and LanguageSelector the old standalone screen had. Renders purely from
// the MenuItem fields already present on every item in menu-home.tsx's
// categories tree — no fetch, no local translation state (research.md §2).
export function ItemAccordionBody({
  item,
  categoryName,
}: {
  item: MenuItem;
  categoryName: string;
}) {
  return (
    <div className="mt-3 border-t border-border pt-3">
      <div
        className={cn(
          "relative flex h-[200px] w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-chart-2 text-primary-foreground/80",
          item.isSoldOut && "grayscale-[70%]"
        )}
      >
        {item.photoUrl ? (
          <Image
            loader={cloudinaryLoader}
            src={item.photoUrl}
            alt=""
            fill
            sizes="(min-width: 430px) 430px, 100vw"
            className="object-cover"
          />
        ) : (
          <ImageOff size={48} strokeWidth={1.2} className="opacity-85" />
        )}
      </div>

      {item.description && (
        <p className="mt-3 text-[0.9rem] text-muted-foreground">{item.description}</p>
      )}

      <div className="mt-3 flex items-center justify-between rounded-lg bg-muted px-4 py-3 text-[0.85rem] text-muted-foreground">
        <span>Category</span>
        <span className="font-medium text-foreground">{categoryName}</span>
      </div>
    </div>
  );
}
