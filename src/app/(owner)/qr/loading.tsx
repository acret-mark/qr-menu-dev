import { Skeleton } from "@/components/ui/skeleton";
import { OwnerPageHeaderSkeleton } from "@/components/dashboard/owner-shell-skeleton";

// Note: no OwnerShell wrapper — see dashboard/loading.tsx.
export default function QrLoading() {
  return (
    <div className="flex flex-col gap-4">
      <OwnerPageHeaderSkeleton />
      <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6">
        <Skeleton className="size-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </div>
  );
}
