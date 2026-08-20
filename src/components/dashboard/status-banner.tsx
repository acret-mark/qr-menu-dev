import { MaybeLink } from "@/components/dashboard/maybe-link";

const BANNER_TEXT: Record<"pending" | "trial", string> = {
  pending: "Your account is awaiting payment verification.",
  trial: "You're on a free trial — add a plan to keep access.",
};

const SUBSCRIPTION_SCREEN_ENABLED = true;
const SUBSCRIPTION_PATH = "/business-profile#subscription";

export function StatusBanner({ status }: { status: "pending" | "trial" }) {
  return (
    <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
      <p>{BANNER_TEXT[status]}</p>
      <MaybeLink
        href={SUBSCRIPTION_PATH}
        enabled={SUBSCRIPTION_SCREEN_ENABLED}
        className="mt-1 inline-block text-sm font-medium underline underline-offset-2"
      >
        Complete your subscription
      </MaybeLink>
    </div>
  );
}
