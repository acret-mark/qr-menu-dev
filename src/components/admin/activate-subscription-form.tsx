"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { activateSubscription, rejectSubscription } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import type { PlanType } from "@/lib/admin/types";

const PLAN_OPTIONS: { value: PlanType; label: string }[] = [
  { value: "standard", label: "Standard — ₱299/month" },
  { value: "pro", label: "Pro — ₱399/month" },
];

const FIELD_CLASSNAME =
  "h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function oneMonthAfter(dateIso: string) {
  const date = new Date(dateIso);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 10);
}

export function ActivateSubscriptionForm({
  subscriptionId,
  businessName,
  contactEmail,
  plan: submittedPlan,
}: {
  subscriptionId: string;
  businessName: string;
  contactEmail: string | null;
  plan: PlanType;
}) {
  const router = useRouter();
  const initialStartsAt = todayIso();

  const [plan, setPlan] = useState<PlanType>(submittedPlan);
  const [startsAt, setStartsAt] = useState(initialStartsAt);
  const [expiresAt, setExpiresAt] = useState(oneMonthAfter(initialStartsAt));
  const [expiresAtTouched, setExpiresAtTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleStartsAtChange(value: string) {
    setStartsAt(value);
    // Keep the billing window at one month unless the admin has deliberately
    // overridden the end date themselves.
    if (!expiresAtTouched) {
      setExpiresAt(oneMonthAfter(value));
    }
  }

  async function handleActivate() {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await activateSubscription({
        subscriptionId,
        plan,
        startsAt,
        expiresAt,
        businessName,
        contactEmail,
      });

      if (!result.ok) {
        setError(result.reason);
        return;
      }

      // Re-fetches the server component, which now renders the
      // already-resolved branch instead of this form (FR-008) — this is
      // what makes a second click structurally harmless (FR-007).
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReject() {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await rejectSubscription({ subscriptionId });
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
    <div>
      <div className="mb-3.5 flex flex-col gap-1.5">
        <label htmlFor="plan-select" className="text-sm font-medium">
          Plan
        </label>
        <select
          id="plan-select"
          value={plan}
          onChange={(e) => setPlan(e.target.value as PlanType)}
          className={FIELD_CLASSNAME}
        >
          {PLAN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3.5 flex flex-col gap-1.5">
        <label htmlFor="starts-at" className="text-sm font-medium">
          Billing starts
        </label>
        <input
          id="starts-at"
          type="date"
          value={startsAt}
          onChange={(e) => handleStartsAtChange(e.target.value)}
          className={FIELD_CLASSNAME}
        />
      </div>

      <div className="mb-5 flex flex-col gap-1.5">
        <label htmlFor="expires-at" className="text-sm font-medium">
          Billing ends
        </label>
        <input
          id="expires-at"
          type="date"
          value={expiresAt}
          onChange={(e) => {
            setExpiresAtTouched(true);
            setExpiresAt(e.target.value);
          }}
          className={FIELD_CLASSNAME}
        />
      </div>

      {error && (
        <div className="mb-3.5 rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        type="button"
        size="lg"
        disabled={isSubmitting}
        onClick={handleActivate}
        className="h-11 w-full"
      >
        {isSubmitting ? "Activating…" : "Activate Subscription"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={isSubmitting}
        onClick={handleReject}
        className="mt-2.5 h-11 w-full"
      >
        Reject Payment
      </Button>
    </div>
  );
}
