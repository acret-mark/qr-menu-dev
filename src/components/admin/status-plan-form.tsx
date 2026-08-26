"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setBusinessStatusAndPlan } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import type { BusinessStatus, PlanType } from "@/lib/admin/types";

const STATUS_OPTIONS: { value: BusinessStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "trial", label: "Trial" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

const PLAN_OPTIONS: { value: PlanType; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "pro", label: "Pro" },
];

// Matches buttonVariants' "xs" size (src/components/ui/button.tsx) exactly —
// h-6/px-2/text-xs/same radius expression — so the two selects and the
// "Apply" button next to them read as one uniform control group (spec FR-009).
const FIELD_CLASSNAME =
  "h-6 rounded-[min(var(--radius-md),10px)] border border-border bg-background px-2 text-xs font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

// globals.css floors every input/select/textarea at 16px (iOS Safari
// auto-zoom guard for mobile-facing forms) via an unlayered rule that beats
// any Tailwind class, including text-xs above. This admin panel is
// desktop-only (SRS §7.6) — no mobile-zoom exposure — so this control
// deliberately opts out via an inline style, the one thing that outranks
// that rule, without touching the guardrail itself (spec FR-009, amendment
// 3; research.md §8c).
const FIELD_STYLE = { fontSize: "0.75rem" };

export function StatusPlanForm({
  businessId,
  slug,
  currentStatus,
  currentPlan,
}: {
  businessId: string;
  slug: string;
  currentStatus: BusinessStatus;
  currentPlan: PlanType;
}) {
  const router = useRouter();

  const [status, setStatus] = useState<BusinessStatus>(currentStatus);
  const [plan, setPlan] = useState<PlanType>(currentPlan);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function isBackwardMove() {
    const movesOffActive = currentStatus === "active" && status !== currentStatus;
    const movesOffPro =
      currentPlan === "pro" &&
      (currentStatus === "active" || currentStatus === "trial") &&
      plan === "standard" &&
      (status === "active" || status === "trial");
    return movesOffActive || movesOffPro;
  }

  async function handleApply() {
    if (isBackwardMove()) {
      const confirmed = window.confirm(
        `This business is currently ${currentStatus}/${currentPlan}. Apply status=${status}, plan=${plan}?`
      );
      if (!confirmed) {
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await setBusinessStatusAndPlan({ businessId, status, plan, slug });

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
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        <select
          aria-label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as BusinessStatus)}
          className={FIELD_CLASSNAME}
          style={FIELD_STYLE}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Plan"
          value={plan}
          onChange={(e) => setPlan(e.target.value as PlanType)}
          className={FIELD_CLASSNAME}
          style={FIELD_STYLE}
        >
          {PLAN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button type="button" variant="outline" size="xs" disabled={isSubmitting} onClick={handleApply}>
          {isSubmitting ? "Applying…" : "Apply"}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
