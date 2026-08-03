import Link from "next/link";

export default function PendingPaymentNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col items-start gap-3">
      <h1 className="font-heading text-2xl font-semibold">Payment not found</h1>
      <p className="text-sm text-muted-foreground">
        This payment doesn&apos;t exist or may have already been removed.
      </p>
      <Link href="/admin/payments" className="text-sm font-medium text-primary underline">
        Back to Payment Queue
      </Link>
    </div>
  );
}
