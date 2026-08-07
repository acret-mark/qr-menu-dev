"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadImage } from "@/lib/cloudinary/client";
import { validateLogoFile } from "@/lib/business/logo-validation";
import { PLAN_PRICES, type PlanType } from "./types";

const OFFERED_PAYMENT_METHODS = ["gcash", "bank_transfer"] as const;
type OfferedPaymentMethod = (typeof OFFERED_PAYMENT_METHODS)[number];

function isOfferedPaymentMethod(value: FormDataEntryValue | null): value is OfferedPaymentMethod {
  return (
    typeof value === "string" && (OFFERED_PAYMENT_METHODS as readonly string[]).includes(value)
  );
}

export type SubmitSubscriptionPaymentResult = { ok: true } | { ok: false; message: string };

export async function submitSubscriptionPayment(
  formData: FormData
): Promise<SubmitSubscriptionPaymentResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be signed in to submit a payment." };
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, plan")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessError || !business) {
    return { ok: false, message: "Couldn't find your business. Please try again." };
  }

  const paymentMethod = formData.get("paymentMethod");
  if (!isOfferedPaymentMethod(paymentMethod)) {
    return { ok: false, message: "Please choose a payment method." };
  }

  const targetPlan = formData.get("targetPlan");
  if (targetPlan !== "current" && targetPlan !== "pro") {
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, message: "Please attach proof of payment." };
  }

  const validationError = validateLogoFile(file);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const plan: PlanType = targetPlan === "pro" ? "pro" : business.plan;
  const amount = PLAN_PRICES[plan];

  let proofUrl: string;
  try {
    proofUrl = await uploadImage(file, { folder: "payment-proofs" });
  } catch {
    return { ok: false, message: "The upload failed. Please try again." };
  }

  const { error: insertError } = await supabase.from("subscriptions").insert({
    business_id: business.id,
    plan,
    amount,
    status: "pending",
    payment_method: paymentMethod,
    payment_proof_url: proofUrl,
  });

  if (insertError) {
    return {
      ok: false,
      message: "The proof uploaded, but we couldn't save it. Please try again.",
    };
  }

  return { ok: true };
}
