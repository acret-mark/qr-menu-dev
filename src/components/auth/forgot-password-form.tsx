"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENT_MESSAGE = "If that email is registered, we've sent a link to reset your password.";
const RATE_LIMITED_MESSAGE =
  "You've requested this recently — please wait a bit before trying again.";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "rate-limited">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setFieldError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFieldError("Email is required.");
      return;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setFieldError("Enter a valid email address.");
      return;
    }

    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);

    if (error && error.code === "over_email_send_rate_limit") {
      setStatus("rate-limited");
      return;
    }

    // Per FR-003: show the identical acknowledgment whether the email exists
    // or not, and for any error that isn't the rate limit above — Supabase's
    // own /recover endpoint never distinguishes account existence itself.
    setStatus("sent");
  }

  if (status === "sent") {
    return <p className="mt-6 text-center text-sm text-muted-foreground">{SENT_MESSAGE}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex w-full flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@business.com"
          className={cn(
            "h-11 rounded-lg border border-border bg-background px-3.5 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            fieldError && "border-destructive"
          )}
          aria-invalid={!!fieldError}
        />
        {fieldError && <span className="text-xs text-destructive">{fieldError}</span>}
      </div>

      {status === "rate-limited" && (
        <div className="rounded-lg bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
          {RATE_LIMITED_MESSAGE}
        </div>
      )}

      <Button type="submit" size="lg" disabled={status === "sending"} className="mt-2 h-11 w-full">
        {status === "sending" ? "Sending…" : "Send Reset Link"}
      </Button>
    </form>
  );
}
