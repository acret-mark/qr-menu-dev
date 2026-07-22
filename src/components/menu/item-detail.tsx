"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ImageOff, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "./language-selector";
import { LANG_COOKIE_NAME } from "@/lib/menu/types";
import type { Business, ItemDetail as ItemDetailData, DisplayLanguage } from "@/lib/menu/types";

export function ItemDetail({
  business,
  item,
  initialLanguage,
  initialDescription,
  fromSearchQuery,
}: {
  business: Business;
  item: ItemDetailData;
  initialLanguage: DisplayLanguage;
  initialDescription: string | null;
  fromSearchQuery?: string;
}) {
  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage);
  const [descriptionsByLanguage, setDescriptionsByLanguage] = useState<
    Partial<Record<DisplayLanguage, string | null>>
  >({ [initialLanguage]: initialDescription });

  const description = descriptionsByLanguage[currentLanguage] ?? initialDescription;

  const backHref =
    fromSearchQuery !== undefined
      ? `/menu/${business.slug}/search?q=${encodeURIComponent(fromSearchQuery)}`
      : `/menu/${business.slug}?cat=${item.categoryId}`;

  async function handleLanguageChange(language: DisplayLanguage) {
    if (language === currentLanguage) return;

    setCurrentLanguage(language);
    document.cookie = `${LANG_COOKIE_NAME}=${language}; path=/; max-age=31536000; samesite=lax`;

    if (descriptionsByLanguage[language] !== undefined) return;

    try {
      const response = await fetch(`/menu/${business.slug}/translations?lang=${language}`);
      if (!response.ok) throw new Error("translation fetch failed");
      const translations = await response.json();
      setDescriptionsByLanguage((cache) => ({
        ...cache,
        [language]: translations.itemDescriptions[item.id] ?? item.description,
      }));
    } catch {
      setDescriptionsByLanguage((cache) => ({ ...cache, [language]: item.description }));
    }
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="relative">
          <Link
            href={backHref}
            aria-label="Back to menu"
            className="absolute left-3.5 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-md"
          >
            <ChevronLeft size={18} />
          </Link>

          {business.plan === "pro" && (
            <div className="absolute right-3.5 top-3.5 z-10">
              <LanguageSelector current={currentLanguage} onChange={handleLanguageChange} />
            </div>
          )}

          {(item.isBestSeller || item.isSoldOut) && (
            <span
              className={cn(
                "absolute right-3.5 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold",
                business.plan === "pro" ? "top-14" : "top-3.5",
                item.isSoldOut
                  ? "bg-muted-foreground text-card"
                  : "bg-accent text-accent-foreground"
              )}
            >
              {item.isSoldOut ? (
                "Sold Out"
              ) : (
                <>
                  <Star size={11} fill="currentColor" strokeWidth={0} /> Best Seller
                </>
              )}
            </span>
          )}

          <div
            className={cn(
              "flex h-[280px] w-full items-center justify-center bg-gradient-to-br from-primary to-chart-2 text-primary-foreground/80",
              item.isSoldOut && "grayscale-[70%]"
            )}
          >
            {item.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageOff size={64} strokeWidth={1.2} className="opacity-85" />
            )}
          </div>
        </div>

        <div className="px-5 pt-5">
          <h1 className="text-[1.5rem]">{item.name}</h1>
          <div className="mt-1.5 text-[1.25rem] font-semibold text-primary">
            ₱{item.price.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          {description && (
            <p className="mt-3.5 text-[0.95rem] text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="mt-auto p-5">
          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3 text-[0.85rem] text-muted-foreground">
            <span>Category</span>
            <span className="font-medium text-foreground">{item.categoryName}</span>
          </div>
        </div>
      </div>

      {business.plan === "standard" && (
        <footer className="shrink-0 border-t border-border bg-card px-4 py-2.5 text-center text-[0.76rem] text-muted-foreground">
          <Link href="/register" className="no-underline">
            Want this smart digital menu for your food business?{" "}
            <strong className="font-heading text-primary">Grab yours now</strong>
          </Link>
        </footer>
      )}
    </>
  );
}
