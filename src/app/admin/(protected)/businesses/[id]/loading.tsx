import { AdminTableSkeleton } from "@/components/admin/admin-shell-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

// Note: no AdminShellSkeleton wrapper — see (protected)/loading.tsx for why.
export default function BusinessDetailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <div className="flex items-center gap-3">
        <div>
          <Skeleton className="h-7 w-56" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <Skeleton className="ml-auto h-6 w-20 rounded-full" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card px-5 py-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-7 w-14" />
          </div>
        ))}
      </div>

      <AdminTableSkeleton rows={4} columns={2} />
    </div>
  );
}
