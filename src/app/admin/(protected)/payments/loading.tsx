import {
  AdminPageHeaderSkeleton,
  AdminTableSkeleton,
} from "@/components/admin/admin-shell-skeleton";

// Note: no AdminShellSkeleton wrapper — see (protected)/loading.tsx for why.
export default function PaymentQueueLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <AdminPageHeaderSkeleton />
      <AdminTableSkeleton rows={5} columns={7} />
    </div>
  );
}
