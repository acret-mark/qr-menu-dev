"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function ConfirmEmailScreen({ email }: { email: string | null }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleResend() {
    if (!email) return;
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail size={24} />
        </div>
        <h1 className="mt-4 font-heading text-2xl font-semibold">Check your email</h1>
        <p className="mt-2 max-w-[30ch] text-sm text-muted-foreground">
          We sent a confirmation link to{" "}
          {email ? <strong className="text-foreground">{email}</strong> : "your inbox"}. Open it to
          activate your account.
        </p>

        <Button
          type="button"
          size="lg"
          className="mt-8 h-11 w-full"
          disabled={!email || status === "sending"}
          onClick={handleResend}
        >
          {status === "sending" ? "Resending…" : "Resend email"}
        </Button>
        {status === "sent" && (
          <p className="mt-2 text-xs text-muted-foreground">Email resent — check your inbox.</p>
        )}
        {status === "error" && (
          <p className="mt-2 text-xs text-destructive">Couldn&apos;t resend right now. Try again shortly.</p>
        )}

        <div className="mt-6 text-sm text-muted-foreground">
          Wrong email?{" "}
          <Link href="/register" className="text-primary underline-offset-4 hover:underline">
            Start over
          </Link>
        </div>
      </div>
    </div>
  );
}
