"use client";

import { cn } from "@/lib/utils";
import type { MenuCategory } from "@/lib/menu/types";

export function CategoryTabs({
  categories,
  activeCategoryId,
  onSelect,
}: {
  categories: MenuCategory[];
  activeCategoryId: string | null;
  onSelect: (categoryId: string) => void;
}) {
  return (
    <nav className="sticky top-0 z-10 mt-2 overflow-x-auto border-b border-border bg-background px-4 py-3.5">
      <ul className="flex gap-2">
        {categories.map((category) => (
          <li key={category.id} className="shrink-0">
            <button
              type="button"
              onClick={() => onSelect(category.id)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[0.88rem] font-medium",
                category.id === activeCategoryId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground"
              )}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
