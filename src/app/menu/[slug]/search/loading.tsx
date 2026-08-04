import { Skeleton } from "@/components/ui/skeleton";

export default function SearchResultsLoading() {
  return (
    <div className="mx-auto w-full flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-card p-4">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <Skeleton className="h-11 flex-1 rounded-full" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <ul className="flex flex-col gap-3 px-4 pb-6 pt-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <li key={index} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
              <Skeleton className="h-[76px] w-[76px] shrink-0 rounded-lg" />
              <div className="flex flex-1 flex-col gap-2 py-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="mt-auto h-4 w-16" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
