import { Skeleton } from "@/components/ui/skeleton";

// Note: no AdminShellSkeleton wrapper — see (protected)/loading.tsx for why.
export default function ActivateSubscriptionLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
      <div>
        <Skeleton className="h-7 w-64" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2.5 h-56 w-full rounded-lg" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-1.5 h-4 w-full" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-11 w-full rounded-lg" />
          <Skeleton className="mt-3 h-11 w-full rounded-lg" />
          <Skeleton className="mt-4 h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
