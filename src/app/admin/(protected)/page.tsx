import Link from "next/link";
import { getBusinessList } from "@/lib/admin/queries";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatCard } from "@/components/admin/stat-card";

function formatCreatedDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BusinessListPage() {
  const businesses = await getBusinessList();

  const total = businesses.length;
  const active = businesses.filter((b) => b.status === "active").length;
  const trial = businesses.filter((b) => b.status === "trial").length;
  const needsAttention = businesses.filter(
    (b) => b.status === "trial" || b.status === "pending"
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Businesses</h1>
        <p className="text-sm text-muted-foreground">All registered Hapag accounts.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Businesses" value={total} />
        <StatCard label="Active" value={active} />
        <StatCard label="On Trial" value={trial} />
        <StatCard label="Needs Attention" value={needsAttention} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {businesses.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            No businesses registered yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Business</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Signed Up</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((business) => {
                const href = `/admin/businesses/${business.id}`;
                return (
                  <tr
                    key={business.id}
                    className="border-b border-border last:border-none hover:bg-muted"
                  >
                    <td className="p-0">
                      <Link href={href} className="block px-5 py-3.5">
                        {business.name}
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link href={href} className="block px-5 py-3.5 capitalize">
                        {business.plan}
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link href={href} className="block px-5 py-3.5">
                        <StatusBadge status={business.status} />
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link href={href} className="block px-5 py-3.5">
                        {formatCreatedDate(business.createdAt)}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
