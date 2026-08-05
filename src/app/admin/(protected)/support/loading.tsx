import { AdminPageHeaderSkeleton } from "@/components/admin/admin-shell-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

// Note: no AdminShellSkeleton wrapper — see (protected)/loading.tsx for why.
export default function SupportTicketsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <AdminPageHeaderSkeleton />

      <div className="grid gap-4 overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:border-b-0 sm:border-r">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5 rounded-lg border border-border p-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 p-5">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-auto h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
