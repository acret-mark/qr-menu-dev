"use server";

import { createClient } from "@/lib/supabase/server";

export type SubmitSupportTicketResult = { ok: true } | { ok: false; message: string };

export async function submitSupportTicket(formData: FormData): Promise<SubmitSupportTicketResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be signed in to submit a ticket." };
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessError || !business) {
    return { ok: false, message: "Couldn't find your business. Please try again." };
  }

  const subject = formData.get("subject");
  const message = formData.get("message");

  if (typeof subject !== "string" || subject.trim().length === 0) {
    return { ok: false, message: "Please enter a subject." };
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    return { ok: false, message: "Please describe what's happening." };
  }

  const { error: insertError } = await supabase.from("support_tickets").insert({
    business_id: business.id,
    subject: subject.trim(),
    message: message.trim(),
    status: "open",
  });

  if (insertError) {
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  return { ok: true };
}
