"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ImageOff, Star } from "lucide-react";
import { cloudinaryLoader } from "@/lib/images/cloudinary";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "./language-selector";
import { OfflineIndicator } from "./offline-indicator";
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
  const [isTranslating, setIsTranslating] = useState(false);

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

    setIsTranslating(true);
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
    } finally {
      setIsTranslating(false);
    }
  }

  return (
    <>
      <OfflineIndicator />
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
              <LanguageSelector
                current={currentLanguage}
                onChange={handleLanguageChange}
                isTranslating={isTranslating}
              />
            </div>
          )}

          {(item.isSoldOut || item.isBestSeller) && (
            <div
              className={cn(
                "absolute right-3.5 z-10 flex flex-col items-end gap-1.5",
                business.plan === "pro" ? "top-14" : "top-3.5"
              )}
            >
              {item.isSoldOut && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted-foreground px-2.5 py-1 text-[0.72rem] font-semibold text-card">
                  Sold Out
                </span>
              )}
              {item.isBestSeller && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[0.72rem] font-semibold text-accent-foreground">
                  <Star size={11} fill="currentColor" strokeWidth={0} /> Best Seller
                </span>
              )}
            </div>
          )}

          <div
            className={cn(
              "relative flex h-[280px] w-full items-center justify-center bg-gradient-to-br from-primary to-chart-2 text-primary-foreground/80",
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
                priority
                className="object-cover"
              />
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
