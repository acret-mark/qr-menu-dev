import {
  OwnerListSkeleton,
  OwnerPageHeaderSkeleton,
} from "@/components/dashboard/owner-shell-skeleton";

// Note: no OwnerShell wrapper — see dashboard/loading.tsx.
export default function CategoriesLoading() {
  return (
    <div className="flex flex-col gap-4">
      <OwnerPageHeaderSkeleton />
      <OwnerListSkeleton rows={5} />
    </div>
  );
}
