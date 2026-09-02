import { MaybeLink } from "@/components/dashboard/maybe-link";

// Same enabled flag/target as status-banner.tsx's "Complete your subscription"
// link — the existing owner-facing subscription tab (specs/021-owner-
// subscription-tab) is also where a locked owner renews (spec FR-014).
const SUBSCRIPTION_SCREEN_ENABLED = true;
const SUBSCRIPTION_PATH = "/business-profile#subscription";

/**
 * Persistent locked-state banner (specs/032-unified-subscription-lifecycle,
 * spec FR-014) — rendered by the owner dashboard shell whenever
 * access-gate.ts's getSubscriptionAccess() reports not-full access.
 * Deliberately a separate component from status-banner.tsx's "pending"
 * banner: a locked business already had full access once (trial/active) and
 * lost it via the automated expiry lockout, which is a different situation
 * from a business that has never yet been activated.
 */
export function SubscriptionLockedBanner() {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
      <p>Subscription expired — renew to keep editing.</p>
      <p className="mt-0.5 text-muted-foreground">
        Your existing menu and QR codes still work for customers. Editing is paused until you renew.
      </p>
      <MaybeLink
        href={SUBSCRIPTION_PATH}
        enabled={SUBSCRIPTION_SCREEN_ENABLED}
        className="mt-1 inline-block text-sm font-medium underline underline-offset-2"
      >
        Renew your subscription
      </MaybeLink>
    </div>
  );
}
