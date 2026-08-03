import { notFound } from "next/navigation";
import { getPendingPaymentById } from "@/lib/admin/queries";
import { ActivateSubscriptionForm } from "@/components/admin/activate-subscription-form";
import { Badge } from "@/components/admin/badge";
import { formatAdminDate, formatPaymentMethod, formatPeso } from "@/lib/admin/format";
import type { AdminPendingPaymentDetail } from "@/lib/admin/types";

const RESOLVED_TONE: Record<
  Exclude<AdminPendingPaymentDetail["status"], "pending">,
  "success" | "neutral" | "destructive"
> = {
  active: "success",
  expired: "neutral",
  cancelled: "destructive",
};

function AlreadyResolvedCard({ payment }: { payment: AdminPendingPaymentDetail }) {
  const tone = RESOLVED_TONE[payment.status as Exclude<AdminPendingPaymentDetail["status"], "pending">];

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-3 flex items-center gap-2">
        <Badge tone={tone}>{payment.status}</Badge>
        <span className="text-sm text-muted-foreground">This payment has already been resolved.</span>
      </div>
      {payment.status === "active" && payment.activatedAt && (
        <p className="text-sm text-muted-foreground">
          Activated {formatAdminDate(payment.activatedAt)}
          {payment.startsAt && payment.expiresAt
            ? ` · billing ${formatAdminDate(payment.startsAt)} to ${formatAdminDate(payment.expiresAt)}`
            : ""}
          .
        </p>
      )}
    </div>
  );
}

function ProofCard({ payment }: { payment: AdminPendingPaymentDetail }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-2.5 text-xs text-muted-foreground">Payment proof</div>
      {payment.paymentProofUrl ? (
        <a
          href={payment.paymentProofUrl}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-lg border border-border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={payment.paymentProofUrl}
            alt={`Payment proof submitted by ${payment.businessName}`}
            className="h-56 w-full object-cover"
          />
        </a>
      ) : (
        <div className="flex h-56 items-center justify-center rounded-lg border border-border bg-muted text-sm text-muted-foreground">
          No proof submitted
        </div>
      )}
      <div className="mt-3 flex justify-between text-sm">
        <span className="text-muted-foreground">Method</span>
        <span className="font-medium">{formatPaymentMethod(payment.paymentMethod)}</span>
      </div>
      <div className="mt-1.5 flex justify-between text-sm">
        <span className="text-muted-foreground">Amount</span>
        <span className="font-medium">{formatPeso(payment.amount)}</span>
      </div>
    </div>
  );
}

export default async function ActivateSubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payment = await getPendingPaymentById(id);
  if (!payment) notFound();

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Activate Subscription</h1>
        <p className="text-sm text-muted-foreground">
          {payment.businessName} · submitted {formatAdminDate(payment.submittedAt)}
        </p>
      </div>

      {payment.status !== "pending" ? (
        <AlreadyResolvedCard payment={payment} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <ProofCard payment={payment} />
          <ActivateSubscriptionForm
            subscriptionId={payment.id}
            businessName={payment.businessName}
            contactEmail={payment.contactEmail}
            plan={payment.plan}
          />
        </div>
      )}
    </div>
  );
}
