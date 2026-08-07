"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MaybeLink } from "@/components/dashboard/maybe-link";
import { MenuItemRow } from "@/components/items/menu-item-row";
import { setItemSoldOut } from "@/lib/items/actions";
import type { OwnerMenuCategory, OwnerMenuItem } from "@/lib/items/types";

const TOGGLE_ERROR_TIMEOUT_MS = 4000;

export function MenuItemList({
  categories,
  items: initialItems,
}: {
  categories: OwnerMenuCategory[];
  items: OwnerMenuItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pendingRef = useRef(new Map<string, boolean>());
  const errorTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    sortedCategories[0]?.id ?? null
  );

  useEffect(() => {
    const timers = errorTimers.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  if (sortedCategories.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-base text-muted-foreground">
        No categories yet.{" "}
        <MaybeLink href="/categories" enabled={true} className="text-primary underline">
          Create a category
        </MaybeLink>{" "}
        to start adding items.
      </p>
    );
  }

  const activeCategory =
    sortedCategories.find((category) => category.id === activeCategoryId) ?? sortedCategories[0];
  const visibleItems = items.filter((item) => item.categoryId === activeCategory.id);

  function scheduleErrorClear(itemId: string) {
    const existing = errorTimers.current.get(itemId);
    if (existing) {
      clearTimeout(existing);
    }
    const timer = setTimeout(() => {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      errorTimers.current.delete(itemId);
    }, TOGGLE_ERROR_TIMEOUT_MS);
    errorTimers.current.set(itemId, timer);
  }

  async function handleToggle(item: OwnerMenuItem) {
    const nextIsSoldOut = !item.isSoldOut;
    pendingRef.current.set(item.id, nextIsSoldOut);

    setItems((prev) =>
      prev.map((current) => (current.id === item.id ? { ...current, isSoldOut: nextIsSoldOut } : current))
    );
    setErrors((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });

    const result = await setItemSoldOut({ id: item.id, isSoldOut: nextIsSoldOut });

    // Only revert if no newer toggle for this item has been issued since —
    // otherwise a slow, now-stale failure response would clobber a newer
    // optimistic value (research.md §1).
    if (!result.ok && pendingRef.current.get(item.id) === nextIsSoldOut) {
      setItems((prev) =>
        prev.map((current) =>
          current.id === item.id ? { ...current, isSoldOut: !nextIsSoldOut } : current
        )
      );
      setErrors((prev) => ({ ...prev, [item.id]: "Couldn't save — try again" }));
      scheduleErrorClear(item.id);
    }
  }

  return (
    <>
      <nav className="overflow-x-auto border-b border-border px-4 py-3.5">
        <ul className="flex gap-2">
          {sortedCategories.map((category) => (
            <li key={category.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setActiveCategoryId(category.id)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[0.88rem] font-medium",
                  category.id === activeCategory.id
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

      {visibleItems.length === 0 ? (
        <p className="px-4 py-8 text-center text-base text-muted-foreground">
          No items in this category yet.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {visibleItems.map((item) => (
            <MenuItemRow key={item.id} item={item} error={errors[item.id]} onToggle={handleToggle} />
          ))}
        </ul>
      )}
    </>
  );
}
