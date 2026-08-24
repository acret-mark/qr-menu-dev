"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { grantTrial } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";

const DEFAULT_DURATION_DAYS = 14;

export function GrantTrialForm({ businessId }: { businessId: string }) {
  const router = useRouter();

  const [durationDays, setDurationDays] = useState(DEFAULT_DURATION_DAYS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGrant() {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await grantTrial({ businessId, durationDays });

      if (!result.ok) {
        setError(result.reason);
        return;
      }

      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Grant trial for</span>
        <input
          type="number"
          min={1}
          step={1}
          value={durationDays}
          onChange={(e) => setDurationDays(Number(e.target.value))}
          className="h-8 w-16 rounded-lg border border-border bg-background px-2 text-center text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <span className="text-sm text-muted-foreground">days</span>
        <Button type="button" variant="outline" size="sm" disabled={isSubmitting} onClick={handleGrant}>
          {isSubmitting ? "Granting…" : "Grant Trial"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
