import {
  AdminPageHeaderSkeleton,
  AdminTableSkeleton,
} from "@/components/admin/admin-shell-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

// Note: no AdminShellSkeleton wrapper here — AdminShell is rendered by the
// (protected) layout itself, outside this Suspense boundary, so it's already
// on screen by the time this fallback shows. Wrapping it again would nest a
// second sidebar inside the real one.
export default function BusinessListLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <AdminPageHeaderSkeleton />

      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card px-5 py-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-7 w-12" />
          </div>
        ))}
      </div>

      <AdminTableSkeleton rows={6} columns={4} />
    </div>
  );
}
