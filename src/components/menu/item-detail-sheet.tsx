"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Fraunces } from "next/font/google";
import { ImageOff, Star, X } from "lucide-react";
import { cloudinaryLoader } from "@/lib/images/cloudinary";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/lib/menu/types";

// Scoped to this one file, same reasoning as the marketing route's own
// Fraunces load (src/app/(marketing)/layout.tsx): next/font/google's build-
// time transform only bundles this for routes that actually import this
// component, so it doesn't add weight to any other route. Playfair Display
// (font-heading, used elsewhere in this sheet) is already loaded globally —
// this is deliberately a second, different display face for the price only.
const priceFont = Fraunces({ subsets: ["latin"], weight: ["700", "900"], display: "swap" });

// Full-screen slide-up detail sheet, replacing the former inline accordion
// (specs/026-menu-home-rebrand, follow-up request — "clicking a menu item
// slides up the details" over a dimmed backdrop, per mockup). Unlike the old
// accordion — which stayed visible alongside the row it expanded beneath,
// and therefore deliberately didn't repeat name/price/best-seller/sold-out
// (spec 002-public-menu-home FR-002f) — this sheet covers the row entirely
// behind the dimmed backdrop, so it has to be self-contained: it shows
// name/price/best-seller/sold-out itself. Rendered once at MenuHome's top
// level (not per-row inside ItemCard), since only one item is ever expanded
// at a time (useMenuUrlState's existing single-expand/URL-sync rule,
// unchanged by this component).
//
// Animation: slides both ways now (translate-y-full ↔ translate-y-0), via a
// brief setTimeout so the browser paints the closed position first before
// transitioning to open. Closing plays the same transition in reverse before
// telling the parent to actually unmount — `onClose` (which clears
// `expandedItemId`, unmounting this component) fires only after the
// transition's own duration elapses, not immediately on click/Escape/backdrop
// tap, so the sheet is never yanked away mid-frame. Deliberately setTimeout,
// not requestAnimationFrame: browsers fully suspend rAF callbacks whenever
// document.visibilityState is "hidden" (a backgrounded/inactive tab), which
// setTimeout isn't subject to — found via browser automation testing, where
// the tab is considered non-visible even though it's the one being driven.
const TRANSITION_MS = 300;

export function ItemDetailSheet({
  item,
  categoryName,
  onClose,
}: {
  item: MenuItem;
  categoryName: string;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setOpen(true), 20);
    return () => clearTimeout(id);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setTimeout(onClose, TRANSITION_MS);
  }, [onClose]);

  // Body scroll lock while the sheet is open — standard modal behavior,
  // restores whatever the previous inline value was on close/unmount.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  return (
    // `absolute`, not `fixed` — deliberately scoped to the app's own
    // `relative`-positioned mobile-frame wrapper (src/app/menu/[slug]/
    // page.tsx), not the browser viewport. The whole app is a centered
    // max-w-[430px] column even on desktop; a `fixed` overlay would ignore
    // that and span the full browser width instead of staying mobile-first.
    <div className="absolute inset-0 z-50" role="dialog" aria-modal="true" aria-label={item.name}>
      {/* Dimmed backdrop — the page behind (hero, search, tabs, the tapped
          row) stays visible but darkened, per the mockup; tapping it closes
          the sheet, same as the close button. Opacity pixel-sampled from
          mockup/4-menu_item.jpg (dimmed hero/panel pixels vs. their known
          undimmed color solve to ~76-79% black, not the ~60% first guessed). */}
      <button
        type="button"
        aria-label="Close"
        onClick={handleClose}
        className="absolute inset-0 bg-black/75"
      />

      <div
        className={cn(
          // No `overflow-hidden` here — this outer box must NOT clip its own
          // children, because the close button below is deliberately
          // positioned half above this box's own top edge (to float over the
          // backdrop/sheet boundary). `overflow-hidden` on this element would
          // clip that overhanging half clean off, leaving only the button's
          // bottom half visible (which is exactly what happened before this
          // fix — the X's bottom half alone reads as a chevron). The rounded
          // top corners still need something to actually clip content to
          // them, so that job moved to the inner scrollable wrapper below,
          // which only wraps the photo/text content, not this button.
          // `duration-300` here must match TRANSITION_MS above — handleClose
          // waits exactly that long before telling the parent to unmount.
          // `min-h-[60vh]` keeps the sheet substantial even for a short
          // description — pixel-measured from mockup/4-menu_item.jpg (sheet
          // occupies the bottom ~68vh there), a bit under that measured
          // figure since the 28vh photo plus this sheet's own padding/text
          // already account for a good chunk of it on their own; real
          // (longer) descriptions still grow the sheet past this floor via
          // content, up to the max-h-[85vh] cap below.
          "absolute inset-x-0 bottom-0 flex max-h-[85vh] min-h-[60vh] flex-col rounded-t-3xl bg-card transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Floats over the backdrop/sheet boundary, per the mockup — genuinely
            unclipped now, not just visually intended to be. */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute left-1/2 top-0 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-md"
        >
          <X size={20} />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-t-3xl">
          <div
            className={cn(
              // Viewport-relative, not a fixed px height — pixel-measured
              // from mockup/4-menu_item.jpg (~28vh) so the photo (and the
              // sheet as a whole) scales with actual viewport height instead
              // of staying visually tiny/"too short" on a taller window,
              // the way a fixed px height would.
              "relative h-[28vh] w-full shrink-0 bg-gradient-to-br from-primary to-chart-2 text-primary-foreground/80",
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
              <div className="flex h-full w-full items-center justify-center">
                <ImageOff size={48} strokeWidth={1.2} className="opacity-85" />
              </div>
            )}
            {item.isSoldOut && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="font-heading text-xl font-bold text-white">Sold Out</span>
              </div>
            )}
          </div>

          <div className="px-5 pb-8 pt-5">
            <div
              className={cn(
                priceFont.className,
                "text-right text-4xl font-bold text-accent tabular-nums"
              )}
            >
              ₱
              {item.price.toLocaleString("en-PH", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 font-heading text-xl font-bold">
              <span>{item.name}</span>
              {item.isBestSeller && (
                <Star size={18} className="shrink-0 fill-warning text-warning" aria-label="Best seller" />
              )}
            </div>
            {item.description && (
              <p className="mt-3 text-[0.92rem] leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            )}
            {/* One pill for this item's actual category — the mockup shows
                several, but the data model has exactly one category per
                item; rendering fabricated extra tags isn't warranted. */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-primary px-3.5 py-1.5 text-[0.82rem] font-medium text-primary">
                {categoryName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
