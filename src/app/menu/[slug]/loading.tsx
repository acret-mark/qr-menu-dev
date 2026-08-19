import { Skeleton } from "@/components/ui/skeleton";

// Mirrors MenuHome's own structure (hero + rounded-overlap panel, unbordered
// item rows) so the loading state doesn't flash the pre-rebrand layout for a
// moment before real content swaps in (specs/026-menu-home-rebrand). The
// business's plan isn't known yet at this point, so the hero's language-
// selector placeholder always renders (a generic shape, not a decision about
// final content) rather than being conditionally shown/hidden.
export default function MenuHomeLoading() {
  return (
    <div className="mx-auto w-full flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <div className="relative shrink-0 bg-primary px-4 pt-5 pb-9">
        <div className="flex justify-end">
          <Skeleton className="h-7 w-16 rounded-full bg-white/40" />
        </div>
      </div>

      <div className="-mt-6 shrink-0 rounded-t-[28px] bg-card px-4 pt-5">
        <Skeleton className="mx-auto h-6 w-40" />
        <Skeleton className="mx-auto mt-2 h-3 w-28" />
        <Skeleton className="mt-3 h-11 rounded-full" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <nav className="mt-2 border-b border-border px-4 py-3.5">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 shrink-0 rounded-full" />
            <Skeleton className="h-9 w-24 shrink-0 rounded-full" />
            <Skeleton className="h-9 w-16 shrink-0 rounded-full" />
          </div>
        </nav>

        <ul className="flex flex-col gap-6 px-4 pb-6 pt-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <li key={index} className="flex gap-4">
              <Skeleton className="h-32 w-32 shrink-0 rounded-2xl" />
              <div className="flex flex-1 flex-col gap-2 pt-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="mt-2 h-5 w-16" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
