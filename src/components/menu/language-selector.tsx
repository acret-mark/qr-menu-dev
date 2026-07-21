"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DisplayLanguage } from "@/lib/menu/types";

const LANGUAGE_LABELS: Record<DisplayLanguage, { short: string; full: string }> = {
  en: { short: "EN", full: "English" },
  ko: { short: "KO", full: "한국어" },
  ja: { short: "JA", full: "日本語" },
  zh: { short: "ZH", full: "中文" },
};

export function LanguageSelector({
  current,
  onChange,
}: {
  current: DisplayLanguage;
  onChange: (language: DisplayLanguage) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative ml-auto shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1.5 text-[0.78rem] font-semibold text-foreground"
      >
        <span>{LANGUAGE_LABELS[current].short}</span>
        <ChevronDown size={12} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute top-[calc(100%+6px)] right-0 z-20 min-w-[140px] rounded-md border border-border bg-card p-1 shadow-lg"
        >
          {(Object.keys(LANGUAGE_LABELS) as DisplayLanguage[]).map((language) => (
            <li key={language}>
              <button
                type="button"
                onClick={() => {
                  onChange(language);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[0.85rem] text-foreground",
                  language === current && "bg-secondary font-semibold"
                )}
              >
                {LANGUAGE_LABELS[language].full}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
