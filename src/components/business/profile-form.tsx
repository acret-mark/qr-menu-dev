"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateBusinessProfile, type BusinessProfile } from "@/lib/business/profile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<Record<"name" | "contactEmail", string>>;

function validate(values: { name: string; contactEmail: string }): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = "Business name is required.";
  }

  const trimmedEmail = values.contactEmail.trim();
  if (trimmedEmail && !EMAIL_PATTERN.test(trimmedEmail)) {
    errors.contactEmail = "Enter a valid email address.";
  }

  return errors;
}

export function ProfileForm({
  initialProfile,
  saveDisabled,
}: {
  initialProfile: BusinessProfile;
  saveDisabled: boolean;
}) {
  const [name, setName] = useState(initialProfile.name);
  const [contactPhone, setContactPhone] = useState(initialProfile.contactPhone ?? "");
  const [contactEmail, setContactEmail] = useState(initialProfile.contactEmail ?? "");
  const [address, setAddress] = useState(initialProfile.address ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "saving" || saveDisabled) return;
    setFormError(null);
    setStatus("idle");

    const errors = validate({ name, contactEmail });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setStatus("saving");
    const supabase = createClient();
    const result = await updateBusinessProfile(supabase, initialProfile.id, {
      name: name.trim(),
      contactPhone: contactPhone.trim() || null,
      contactEmail: contactEmail.trim() || null,
      address: address.trim() || null,
    });

    if (!result.ok) {
      setFormError(result.message);
      setStatus("idle");
      return;
    }

    setStatus("saved");
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="biz-name" className="text-sm font-medium">
          Business name
        </label>
        <input
          id="biz-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={cn(
            "h-11 rounded-lg border border-border bg-background px-3.5 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            fieldErrors.name && "border-destructive"
          )}
          aria-invalid={!!fieldErrors.name}
        />
        <p className="text-xs text-muted-foreground">
          Changing this won&apos;t change your menu link.
        </p>
        {fieldErrors.name && <span className="text-xs text-destructive">{fieldErrors.name}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="biz-phone" className="text-sm font-medium">
          Contact phone
        </label>
        <input
          id="biz-phone"
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          className="h-11 rounded-lg border border-border bg-background px-3.5 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="biz-email" className="text-sm font-medium">
          Contact email
        </label>
        <input
          id="biz-email"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className={cn(
            "h-11 rounded-lg border border-border bg-background px-3.5 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            fieldErrors.contactEmail && "border-destructive"
          )}
          aria-invalid={!!fieldErrors.contactEmail}
        />
        {fieldErrors.contactEmail && (
          <span className="text-xs text-destructive">{fieldErrors.contactEmail}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="biz-address" className="text-sm font-medium">
          Address <span className="font-normal text-muted-foreground">(optional — shown on menu)</span>
        </label>
        <textarea
          id="biz-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="h-16 rounded-lg border border-border bg-background px-3.5 py-2.5 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {formError && (
        <div className="rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
          {formError}
        </div>
      )}
      {status === "saved" && (
        <p className="text-xs text-muted-foreground">Saved.</p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={status === "saving" || saveDisabled}
        className="mt-2 h-11 w-full"
      >
        {status === "saving" ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
