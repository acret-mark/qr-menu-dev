const PAYMENT_METHOD_LABELS: Record<string, string> = {
  gcash: "GCash",
  bank_transfer: "Bank Transfer",
};

export function formatPaymentMethod(method: string | null) {
  if (!method) return "—";
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

export function formatAdminDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  maximumFractionDigits: 2,
});

/** ₱299 for whole amounts, ₱299.5 only when there are actual centavos. */
export function formatPeso(amount: number) {
  return `₱${pesoFormatter.format(amount)}`;
}

/**
 * Days a pending payment has been waiting. `isStale` marks the 3-day threshold
 * the Payment Queue emphasises (A-04, FR-014) — presentation only: it triggers
 * no email, escalation, or state change, and commits to no SLA.
 */
export const STALE_AFTER_DAYS = 3;

export function formatWaitingTime(iso: string): { label: string; isStale: boolean } {
  const elapsedMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(elapsedMs / 86_400_000);

  if (days < 1) return { label: "Today", isStale: false };

  return {
    label: days === 1 ? "1 day" : `${days} days`,
    isStale: days >= STALE_AFTER_DAYS,
  };
}
