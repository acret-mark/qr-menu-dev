"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { submitSupportTicket } from "@/lib/support/actions";

export function SupportTicketForm() {
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = subject.trim() !== "" && message.trim() !== "" && !isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("subject", subject);
    formData.set("message", message);

    const result = await submitSupportTicket(formData);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSubject("");
    setMessage("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 px-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ticket-subject" className="text-sm font-medium">
          Subject
        </label>
        <input
          id="ticket-subject"
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="What's the issue about?"
          className="h-11 rounded-lg border border-border bg-background px-3.5 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="ticket-message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="ticket-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Describe what's happening..."
          className="min-h-[120px] rounded-lg border border-border bg-background px-3.5 py-2 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={!canSubmit} className="mt-1 h-11">
        {isSubmitting ? "Submitting…" : "Submit Ticket"}
      </Button>
    </form>
  );
}
