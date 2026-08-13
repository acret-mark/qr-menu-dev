import { Skeleton } from "@/components/ui/skeleton";

// Note: no OwnerShell wrapper — see dashboard/loading.tsx. AccountTabs owns
// its own card chrome (header + tab strip), so this mirrors that shape
// instead of reusing OwnerPageHeaderSkeleton.
export default function BusinessProfileLoading() {
  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border p-6 pb-4">
        <Skeleton className="h-7 w-40" />
      </div>
      <div className="flex gap-6 border-b border-border px-4 py-3.5">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}
