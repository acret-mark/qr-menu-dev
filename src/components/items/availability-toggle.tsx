"use client";

import { Switch } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

export function AvailabilityToggle({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={checked ? "Available — tap to mark sold out" : "Sold out — tap to mark available"}
      className={cn(
        "relative flex h-6 w-10 shrink-0 items-center rounded-full border border-transparent bg-muted transition-colors",
        "data-[checked]:bg-primary"
      )}
    >
      <Switch.Thumb
        className={cn(
          "block size-4.5 translate-x-0.5 rounded-full bg-card shadow transition-transform",
          "data-[checked]:translate-x-[1.25rem]"
        )}
      />
    </Switch.Root>
  );
}
