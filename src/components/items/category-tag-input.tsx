"use client";

import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryOption {
  id: string;
  name: string;
}

// Suggest-only multi-select combobox for assigning an item to one or more
// categories (035-item-multiple-categories). Modeled directly on
// ingredient-tag-input.tsx's Combobox/Chips pattern but with its
// "creatable"/Empty-slot branch removed entirely — owners pick only from
// categories that already exist (created via the separate category manager),
// there is no "add a new category from this field" affordance (research.md
// §1).
export function CategoryTagInput({
  id,
  categories,
  value,
  onChange,
}: {
  id: string;
  categories: CategoryOption[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [query, setQuery] = React.useState("");

  const selected: CategoryOption[] = value
    .map((categoryId) => categories.find((category) => category.id === categoryId))
    .filter((category): category is CategoryOption => category !== undefined);

  function handleValueChange(next: CategoryOption[]) {
    onChange(next.map((category) => category.id));
    setQuery("");
  }

  return (
    <Combobox.Root
      items={categories}
      multiple
      value={selected}
      onValueChange={handleValueChange}
      inputValue={query}
      onInputValueChange={setQuery}
      itemToStringLabel={(item: CategoryOption) => item.name}
    >
      <Combobox.InputGroup className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 focus-within:ring-3 focus-within:ring-ring/50">
        <Combobox.Chips className="flex flex-wrap items-center gap-1.5">
          <Combobox.Value>
            {(chips: CategoryOption[]) => (
              <>
                {chips.map((chip) => (
                  <Combobox.Chip
                    key={chip.id}
                    className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-sm"
                  >
                    {chip.name}
                    <Combobox.ChipRemove aria-label={`Remove ${chip.name}`} className="text-muted-foreground">
                      <X size={14} />
                    </Combobox.ChipRemove>
                  </Combobox.Chip>
                ))}
                <Combobox.Input
                  id={id}
                  placeholder={chips.length > 0 ? "" : "Select categories"}
                  className="h-7 min-w-24 flex-1 bg-transparent text-base outline-none"
                />
              </>
            )}
          </Combobox.Value>
        </Combobox.Chips>
      </Combobox.InputGroup>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} className="z-50">
          <Combobox.Popup className="max-h-64 overflow-y-auto rounded-lg border border-border bg-popover shadow-md">
            <Combobox.Empty className="px-3.5 py-2 text-sm text-muted-foreground">
              No categories found.
            </Combobox.Empty>
            <Combobox.List>
              {(item: CategoryOption) => (
                <Combobox.Item
                  key={item.id}
                  value={item}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-3.5 py-2 text-sm",
                    "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                  )}
                >
                  <Combobox.ItemIndicator className="shrink-0">
                    <Check size={14} />
                  </Combobox.ItemIndicator>
                  <span>{item.name}</span>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
