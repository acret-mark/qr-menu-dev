import { Skeleton } from "@/components/ui/skeleton";

export function AdminPageHeaderSkeleton() {
  return (
    <div>
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-2 h-4 w-64" />
    </div>
  );
}

export function AdminTableSkeleton({ rows = 6, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <tbody>
          {Array.from({ length: rows }).map((_, row) => (
            <tr key={row} className="border-b border-border last:border-none">
              {Array.from({ length: columns }).map((_, col) => (
                <td key={col} className="px-5 py-3.5">
                  <Skeleton className="h-4 w-full max-w-32" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
