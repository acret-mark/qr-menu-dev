"use client";

import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Check, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type IngredientTag = { id: string } | { name: string };

interface IngredientOption {
  id: string;
  name: string;
  creatable?: string;
}

function tagKey(tag: IngredientTag): string {
  return "id" in tag ? tag.id : `new:${tag.name.toLowerCase()}`;
}

// Drupal-taxonomy-like suggest-or-create tag input, built on @base-ui/react's
// Combobox in `multiple` mode — the only tag/multiselect primitive in this
// codebase (research.md §1). Modeled directly on that library's own
// "Creatable" combobox example, minus its confirmation Dialog step: FR-003
// calls for immediate attach on create, not a confirm step, so a newly typed
// ingredient is attached to local form state as soon as it's chosen — it only
// becomes a real `ingredients` row when the item itself is saved
// (contracts/save-item-ingredients.md).
export function IngredientTagInput({
  id,
  suggestions,
  value,
  onChange,
}: {
  id: string;
  suggestions: { id: string; name: string }[];
  value: IngredientTag[];
  onChange: (next: IngredientTag[]) => void;
}) {
  const [query, setQuery] = React.useState("");
  const highlightedItemRef = React.useRef<IngredientOption | undefined>(undefined);

  const selected: IngredientOption[] = value.map((tag) => {
    if ("id" in tag) {
      return suggestions.find((suggestion) => suggestion.id === tag.id) ?? { id: tag.id, name: tag.id };
    }
    return { id: tagKey(tag), name: tag.name };
  });

  // A synthetic `new:`-prefixed id (assigned in `selected` above) marks a
  // not-yet-saved tag — it must round-trip back out as `{ name }`, never
  // `{ id }` (that id isn't a real ingredients row; saveItem() would silently
  // drop it as unowned, which is exactly the bug this fixes: any onValueChange
  // that touched an already-added new tag — e.g. removing a *different* chip
  // — was flattening every remaining item to `{ id: item.id }` regardless,
  // corrupting pending tags into a bogus id the next render then displayed
  // literally (the id doubling as a placeholder name via the `selected`
  // fallback two blocks up).
  function toTag(option: IngredientOption): IngredientTag {
    return option.id.startsWith("new:") ? { name: option.name } : { id: option.id };
  }

  function attach(option: IngredientOption) {
    const isDuplicate = selected.some((item) => item.name.toLowerCase() === option.name.toLowerCase());
    if (isDuplicate) return;
    onChange([...value, option.creatable !== undefined ? { name: option.name } : { id: option.id }]);
    setQuery("");
  }

  function handleValueChange(next: IngredientOption[]) {
    const creatableSelection = next.find((item) => item.creatable !== undefined);
    if (creatableSelection) {
      attach(creatableSelection);
      return;
    }
    onChange(next.map(toTag));
    setQuery("");
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || highlightedItemRef.current) return;

    const trimmed = query.trim();
    if (!trimmed) return;

    const existing = suggestions.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    attach(existing ?? { id: `new:${trimmed.toLowerCase()}`, name: trimmed, creatable: trimmed });
  }

  const trimmed = query.trim();
  const lowered = trimmed.toLowerCase();
  const matchesExisting = suggestions.some((s) => s.name.toLowerCase() === lowered);
  const alreadySelected = selected.some((s) => s.name.toLowerCase() === lowered);

  const items: IngredientOption[] =
    trimmed !== "" && !matchesExisting && !alreadySelected
      ? [...suggestions, { id: `create:${lowered}`, name: trimmed, creatable: trimmed }]
      : suggestions;

  return (
    <Combobox.Root
      items={items}
      multiple
      value={selected}
      onValueChange={handleValueChange}
      inputValue={query}
      onInputValueChange={setQuery}
      itemToStringLabel={(item: IngredientOption) => item.name}
      onItemHighlighted={(item) => {
        highlightedItemRef.current = item;
      }}
    >
      <Combobox.InputGroup className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 focus-within:ring-3 focus-within:ring-ring/50">
        <Combobox.Chips className="flex flex-wrap items-center gap-1.5">
          <Combobox.Value>
            {(chips: IngredientOption[]) => (
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
                  onKeyDown={handleInputKeyDown}
                  placeholder={chips.length > 0 ? "" : "e.g. Garlic"}
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
              No ingredients found.
            </Combobox.Empty>
            <Combobox.List>
              {(item: IngredientOption) => (
                <Combobox.Item
                  key={item.id}
                  value={item}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-3.5 py-2 text-sm",
                    "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                  )}
                >
                  {item.creatable !== undefined ? (
                    <>
                      <Plus size={14} className="shrink-0" />
                      <span>Add &ldquo;{item.creatable}&rdquo;</span>
                    </>
                  ) : (
                    <>
                      <Combobox.ItemIndicator className="shrink-0">
                        <Check size={14} />
                      </Combobox.ItemIndicator>
                      <span>{item.name}</span>
                    </>
                  )}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
