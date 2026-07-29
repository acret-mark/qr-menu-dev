import Link from "next/link";

export default function BusinessNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-3">
      <h1 className="font-heading text-2xl font-semibold">Business not found</h1>
      <p className="text-sm text-muted-foreground">
        This business doesn&apos;t exist or may have been removed.
      </p>
      <Link href="/admin" className="text-sm font-medium text-primary underline">
        Back to Businesses
      </Link>
    </div>
  );
}
