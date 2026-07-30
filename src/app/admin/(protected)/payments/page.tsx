import Link from "next/link";
import { getPendingPayments } from "@/lib/admin/queries";
import { PaymentProofThumb } from "@/components/admin/payment-proof-thumb";
import {
  formatAdminDate,
  formatPaymentMethod,
  formatPeso,
  formatWaitingTime,
} from "@/lib/admin/format";
import { cn } from "@/lib/utils";

export default async function PaymentQueuePage() {
  const payments = await getPendingPayments();

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Payment Queue</h1>
        <p className="text-sm text-muted-foreground">Payment proofs waiting for verification.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {payments.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            All caught up — no payment proofs waiting for verification.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Business</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Proof</th>
                <th className="px-5 py-3 font-medium">Submitted</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const waiting = formatWaitingTime(payment.submittedAt);

                return (
                  <tr
                    key={payment.id}
                    className="border-b border-border last:border-none hover:bg-muted"
                  >
                    <td className="px-5 py-3.5">{payment.businessName}</td>
                    <td className="px-5 py-3.5 capitalize">{payment.plan}</td>
                    <td className="px-5 py-3.5">{formatPeso(payment.amount)}</td>
                    <td className="px-5 py-3.5">{formatPaymentMethod(payment.paymentMethod)}</td>
                    <td className="px-5 py-3.5">
                      <PaymentProofThumb
                        url={payment.paymentProofUrl}
                        businessName={payment.businessName}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      {formatAdminDate(payment.submittedAt)}
                      <div
                        className={cn(
                          "mt-0.5 text-xs",
                          waiting.isStale ? "font-medium text-warning" : "text-muted-foreground"
                        )}
                      >
                        {waiting.label}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {/* Subscription-scoped, not business-scoped: one business can
                          have more than one pending payment. A-05 implements here. */}
                      <Link
                        href={`/admin/payments/${payment.id}`}
                        className="inline-flex items-center rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                      >
                        Review
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
