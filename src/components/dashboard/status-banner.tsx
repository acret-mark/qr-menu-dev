const BANNER_TEXT: Record<"pending" | "trial", string> = {
  pending: "Your account is awaiting payment verification.",
  trial: "You're on a free trial — add a plan to keep access.",
};

export function StatusBanner({ status }: { status: "pending" | "trial" }) {
  return (
    <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
      {BANNER_TEXT[status]}
    </div>
  );
}
