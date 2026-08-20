"use client";

import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";

export function ReorderControls({
  isFirst,
  isLast,
  isMoving,
  disabled,
  onMove,
}: {
  isFirst: boolean;
  isLast: boolean;
  isMoving: boolean;
  disabled: boolean;
  onMove: (direction: "up" | "down") => void;
}) {
  if (isMoving) {
    // Same footprint as the two stacked size-6 buttons below (h-12 = 2 * size-6)
    // so the row doesn't reflow while the spinner is shown.
    return (
      <div className="flex h-12 w-6 items-center justify-center text-muted-foreground">
        <Loader2 size={16} className="animate-spin" aria-label="Moving…" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-label="Move up"
        disabled={isFirst || disabled}
        onClick={() => onMove("up")}
        className="flex size-6 items-center justify-center text-muted-foreground disabled:opacity-30 enabled:hover:text-foreground"
      >
        <ChevronUp size={16} />
      </button>
      <button
        type="button"
        aria-label="Move down"
        disabled={isLast || disabled}
        onClick={() => onMove("down")}
        className="flex size-6 items-center justify-center text-muted-foreground disabled:opacity-30 enabled:hover:text-foreground"
      >
        <ChevronDown size={16} />
      </button>
    </div>
  );
}
