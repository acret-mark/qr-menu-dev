import { Skeleton } from "@/components/ui/skeleton";

export default function ItemDetailLoading() {
  return (
    <div className="mx-auto w-full flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <Skeleton className="h-[280px] w-full rounded-none" />

        <div className="px-5 pt-5">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="mt-2 h-5 w-20" />
          <Skeleton className="mt-3.5 h-4 w-full" />
          <Skeleton className="mt-1.5 h-4 w-4/5" />
        </div>

        <div className="mt-auto p-5">
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
