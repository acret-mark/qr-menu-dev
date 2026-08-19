import Image from "next/image";
import { ImageOff, Star } from "lucide-react";
import { cloudinaryLoader } from "@/lib/images/cloudinary";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/lib/menu/types";

// Detail rendering moved out of this row entirely — tapping it now opens
// ItemDetailSheet at MenuHome's top level (a slide-up modal over a dimmed
// backdrop), not an inline accordion beneath this row (specs/026-menu-home-
// rebrand, follow-up request). This row no longer needs `categoryName` or
// `isExpanded` at all — MenuHome looks up the category name itself when it
// renders the sheet.
export function ItemCard({
  item,
  onToggle,
}: {
  item: MenuItem;
  onToggle: () => void;
}) {
  return (
    // No card border/background/padding — the mockup's rows sit directly on
    // the page, separated by whitespace alone (menu-home.tsx's list `gap-6`),
    // not a bordered box per row (specs/026-menu-home-rebrand). Sold-out no
    // longer dims the whole row's text/price either — the mockup keeps name/
    // description/price at full opacity and confines the sold-out treatment
    // entirely to the thumbnail (grayscale + banner below), so the row-level
    // `opacity-60` this screen previously applied is dropped to match.
    <button type="button" onClick={onToggle} className="flex w-full gap-4 text-left">
      <div
        className={cn(
          "relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-chart-2 text-primary-foreground/80",
          item.isSoldOut && "grayscale-[70%]"
        )}
      >
        {item.photoUrl ? (
          <Image
            loader={cloudinaryLoader}
            src={item.photoUrl}
            alt=""
            fill
            sizes="128px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff size={36} strokeWidth={1.5} className="opacity-85" />
          </div>
        )}
        {/* Sold-out now renders as a banner overlaid on the thumbnail itself,
            replacing the old name-adjacent pill (specs/026-menu-home-rebrand,
            spec FR-012). Best-seller moved off the thumbnail entirely — see
            the inline star next to the name below (spec FR-009). Label text
            matches the mockup's own styling exactly: normal case, bold
            serif, no uppercase/letter-spacing treatment. */}
        {item.isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="font-heading text-base font-bold text-white">Sold Out</span>
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col pt-1">
        <div className="flex items-center gap-1.5 font-heading text-[1.05rem] font-bold">
          <span className="truncate">{item.name}</span>
          {item.isBestSeller && (
            <Star size={16} className="shrink-0 fill-warning text-warning" aria-label="Best seller" />
          )}
        </div>
        {item.description && (
          <div className="mt-1 line-clamp-2 text-[0.85rem] text-muted-foreground">
            {item.description}
          </div>
        )}
        <div className="mt-2 text-[1.05rem] font-bold text-accent tabular-nums">
          ₱{item.price.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </div>
      </div>
    </button>
  );
}
