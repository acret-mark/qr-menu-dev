import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBusinessDetail,
  getBusinessMenu,
  getBusinessSubscriptions,
  hasOpenSupportTicket,
} from "@/lib/admin/queries";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/admin/badge";
import { BusinessDetailTabs } from "@/components/admin/business-detail-tabs";
import { formatAdminDate, formatPaymentMethod } from "@/lib/admin/format";
import type { AdminMenuCategory, AdminSubscriptionRecord, SubscriptionStatus } from "@/lib/admin/types";

const SUBSCRIPTION_TONE: Record<SubscriptionStatus, "success" | "warning" | "neutral" | "destructive"> = {
  active: "success",
  pending: "warning",
  expired: "neutral",
  cancelled: "destructive",
};

function OverviewPanel({
  business,
  categoryCount,
  itemCount,
}: {
  business: NonNullable<Awaited<ReturnType<typeof getBusinessDetail>>>;
  categoryCount: number;
  itemCount: number;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Plan" value={business.plan === "pro" ? "Pro" : "Standard"} />
        <StatCard label="Menu Items" value={itemCount} />
        <StatCard label="Categories" value={categoryCount} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-border">
              <td className="w-44 px-5 py-3 text-muted-foreground">Contact phone</td>
              <td className="px-5 py-3">{business.contactPhone ?? "—"}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="px-5 py-3 text-muted-foreground">Contact email</td>
              <td className="px-5 py-3">{business.contactEmail ?? "—"}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="px-5 py-3 text-muted-foreground">Address</td>
              <td className="px-5 py-3">{business.address ?? "—"}</td>
            </tr>
            <tr>
              <td className="px-5 py-3 text-muted-foreground">Signed up</td>
              <td className="px-5 py-3">{formatAdminDate(business.createdAt)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MenuPanel({ categories }: { categories: AdminMenuCategory[] }) {
  const hasItems = categories.some((category) => category.items.length > 0);

  if (!hasItems) {
    return (
      <p className="px-1 py-10 text-center text-sm text-muted-foreground">
        No menu items yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="px-5 py-3 font-medium">Item</th>
            <th className="px-5 py-3 font-medium">Category</th>
            <th className="px-5 py-3 font-medium">Price</th>
            <th className="px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {categories.flatMap((category) =>
            category.items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-none">
                <td className="px-5 py-3">{item.name}</td>
                <td className="px-5 py-3">{category.name}</td>
                <td className="px-5 py-3">₱{item.price.toFixed(2)}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={item.isSoldOut ? "warning" : "success"}>
                      {item.isSoldOut ? "Sold Out" : "Available"}
                    </Badge>
                    {!item.isDisplayed && <Badge tone="neutral">Hidden</Badge>}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function HistoryPanel({ subscriptions }: { subscriptions: AdminSubscriptionRecord[] }) {
  if (subscriptions.length === 0) {
    return (
      <p className="px-1 py-10 text-center text-sm text-muted-foreground">
        No subscription history yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="px-5 py-3 font-medium">Date</th>
            <th className="px-5 py-3 font-medium">Plan</th>
            <th className="px-5 py-3 font-medium">Amount</th>
            <th className="px-5 py-3 font-medium">Method</th>
            <th className="px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((subscription) => (
            <tr key={subscription.id} className="border-b border-border last:border-none">
              <td className="px-5 py-3">{formatAdminDate(subscription.createdAt)}</td>
              <td className="px-5 py-3 capitalize">{subscription.plan}</td>
              <td className="px-5 py-3">₱{subscription.amount.toFixed(2)}</td>
              <td className="px-5 py-3">{formatPaymentMethod(subscription.paymentMethod)}</td>
              <td className="px-5 py-3">
                <Badge tone={SUBSCRIPTION_TONE[subscription.status]}>{subscription.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getBusinessDetail(id);
  if (!business) notFound();

  const menu = await getBusinessMenu(id);
  const categoryCount = menu.length;
  const itemCount = menu.reduce((total, category) => total + category.items.length, 0);

  const subscriptions = await getBusinessSubscriptions(id);
  const hasPendingSubscription = subscriptions.some((s) => s.status === "pending");
  const hasOpenTicket = await hasOpenSupportTicket(id);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{business.name}</h1>
          <p className="text-sm text-muted-foreground">{business.slug}</p>
        </div>
        <StatusBadge status={business.status} className="ml-auto" />
      </div>

      {(hasPendingSubscription || hasOpenTicket) && (
        <div className="flex gap-3">
          {hasPendingSubscription && (
            <Link
              href="/admin/payments"
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Pending payment — review in Payment Queue
            </Link>
          )}
          {hasOpenTicket && (
            <Link
              href="/admin/support"
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Open support ticket — view in Support
            </Link>
          )}
        </div>
      )}

      <BusinessDetailTabs
        overview={
          <OverviewPanel business={business} categoryCount={categoryCount} itemCount={itemCount} />
        }
        menu={<MenuPanel categories={menu} />}
        history={<HistoryPanel subscriptions={subscriptions} />}
      />
    </div>
  );
}
