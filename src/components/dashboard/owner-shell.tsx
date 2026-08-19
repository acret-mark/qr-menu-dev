"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOutOwner } from "@/lib/auth/logout";
import { StatusBanner } from "@/components/dashboard/status-banner";
import { OwnerTabBar } from "@/components/dashboard/owner-tab-bar";

// Mirrors admin-shell.tsx's "AC" avatar (first letter of up to the first two
// words), but derived from the business name instead of hardcoded, since the
// owner side has no fixed staff roster to hardcode initials for.
function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
  return initials.toUpperCase() || "?";
}

export function OwnerShell({
  status,
  businessName,
  children,
}: {
  status: "pending" | "trial" | "active";
  businessName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background px-4 pt-6 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {/* No persistent header existed here before — the tab bar is the
            only other chrome this shell has — so this is a minimal one,
            not a full admin-style header, just enough to host a logout
            control and a profile avatar across every owner page. Logout sits
            beside the avatar (same row), not stacked above it. The avatar is
            the one link into /business-profile from here — the dashboard
            page's own logo-button that used to go there was removed so
            there's a single, consistent entry point instead of two. */}
        <div className="flex items-center justify-between gap-2">
          <Image src="/brand.png" alt="Hapag" width={530} height={154} className="h-6 w-auto shrink-0" />
          <div className="flex items-center gap-2">
            <form action={signOutOwner}>
              <button
                type="submit"
                aria-label="Log out"
                title="Log out"
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut size={14} />
                Log out
              </button>
            </form>
            <Link
              href="/business-profile"
              aria-label="Business profile"
              title={businessName}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {getInitials(businessName)}
            </Link>
          </div>
        </div>
        {(status === "pending" || status === "trial") && <StatusBanner status={status} />}
        {children}
      </div>
      <OwnerTabBar />
    </div>
  );
}
