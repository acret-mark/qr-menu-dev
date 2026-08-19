"use client";

import { LogOut } from "lucide-react";
import { signOutOwner } from "@/lib/auth/logout";
import { StatusBanner } from "@/components/dashboard/status-banner";
import { OwnerTabBar } from "@/components/dashboard/owner-tab-bar";

export function OwnerShell({
  status,
  children,
}: {
  status: "pending" | "trial" | "active";
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background px-4 pt-6 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {/* No persistent header existed here before — the tab bar is the
            only other chrome this shell has — so this is a minimal one,
            not a full admin-style header (no search/avatar needed on this
            side), just enough to host a logout control across every owner
            page. */}
        <div className="flex justify-end">
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
        </div>
        {(status === "pending" || status === "trial") && <StatusBanner status={status} />}
        {children}
      </div>
      <OwnerTabBar />
    </div>
  );
}
