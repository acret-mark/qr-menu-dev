"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";
import { reorderCategory } from "@/lib/categories/actions";

export function ReorderControls({
  categoryId,
  isFirst,
  isLast,
}: {
  categoryId: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [isMoving, setIsMoving] = useState(false);

  async function move(direction: "up" | "down") {
    if (isMoving) return;
    setIsMoving(true);
    await reorderCategory({ id: categoryId, direction });
    setIsMoving(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-label="Move up"
        disabled={isFirst || isMoving}
        onClick={() => move("up")}
        className="flex size-6 items-center justify-center text-muted-foreground disabled:opacity-30 enabled:hover:text-foreground"
      >
        <ChevronUp size={16} />
      </button>
      <button
        type="button"
        aria-label="Move down"
        disabled={isLast || isMoving}
        onClick={() => move("down")}
        className="flex size-6 items-center justify-center text-muted-foreground disabled:opacity-30 enabled:hover:text-foreground"
      >
        <ChevronDown size={16} />
      </button>
    </div>
  );
}
