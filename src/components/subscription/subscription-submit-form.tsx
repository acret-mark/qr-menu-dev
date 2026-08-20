"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { submitSubscriptionPayment } from "@/lib/subscription/actions";
import { PLAN_PRICES, type PlanType } from "@/lib/subscription/types";

export function SubscriptionSubmitForm({ currentPlan }: { currentPlan: PlanType }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [targetPlan, setTargetPlan] = useState<"current" | "pro">("current");
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const canOfferUpgrade = currentPlan === "standard";
  const payingForPlan: PlanType = targetPlan === "pro" ? "pro" : currentPlan;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please attach proof of payment.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSubmitted(false);

    const formData = new FormData();
    formData.set("paymentMethod", paymentMethod);
    formData.set("targetPlan", targetPlan);
    formData.set("file", file);

    const result = await submitSubscriptionPayment(formData);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    setFileName(null);
    setTargetPlan("current");
    setSubmitted(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 px-4">
      {targetPlan === "pro" ? (
        <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3.5 py-2.5 text-sm">
          <span className="font-medium text-primary">
            Paying for: Pro (₱{PLAN_PRICES.pro}/month)
          </span>
          <button
            type="button"
            onClick={() => setTargetPlan("current")}
            className="text-xs font-medium text-muted-foreground underline"
          >
            Cancel
          </button>
        </div>
      ) : (
        canOfferUpgrade && (
          <button
            type="button"
            onClick={() => setTargetPlan("pro")}
            className="text-center text-sm font-semibold text-primary"
          >
            Upgrade to Pro — ₱{PLAN_PRICES.pro}/month →
          </button>
        )
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="payment-method" className="text-sm font-medium">
          Payment method
        </label>
        <select
          id="payment-method"
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value)}
          className="h-11 rounded-lg border border-border bg-background px-3.5 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="gcash">GCash</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Payment proof</span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-sm text-muted-foreground"
        >
          {fileName ?? "Tap to upload screenshot"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            setFileName(event.target.files?.[0]?.name ?? null);
            setSubmitted(false);
          }}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {submitted && (
        <div className="rounded-lg bg-success/10 px-3.5 py-2.5 text-sm text-success">
          Payment proof submitted — we&apos;ll verify it shortly.
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="mt-1 h-11">
        {isSubmitting
          ? "Submitting…"
          : payingForPlan === "pro"
            ? "Submit Pro Upgrade Payment"
            : "Submit for Verification"}
      </Button>
    </form>
  );
}
