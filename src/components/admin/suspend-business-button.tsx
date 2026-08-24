"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { suspendBusiness } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";

export function SuspendBusinessButton({
  businessId,
  label = "Suspend Business",
  confirmMessage = "Suspend this business? The owner will lose access until reactivated.",
}: {
  businessId: string;
  label?: string;
  confirmMessage?: string;
}) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSuspend() {
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await suspendBusiness(businessId);

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
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={isSubmitting}
        onClick={handleSuspend}
      >
        {isSubmitting ? "Suspending…" : label}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
