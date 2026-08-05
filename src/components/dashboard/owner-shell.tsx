"use client";

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
        {(status === "pending" || status === "trial") && <StatusBanner status={status} />}
        {children}
      </div>
      <OwnerTabBar />
    </div>
  );
}
