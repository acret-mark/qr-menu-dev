-- Unified Subscription Lifecycle (specs/032-unified-subscription-lifecycle).
-- Idempotency marker for the T-7/T-1/T-0 expiry-reminder cron. Deliberately
-- separate from the existing `reminder_sent_at`, which belongs to the
-- unrelated pending-payment reminder cron (src/app/api/cron/payment-reminders).
alter table subscriptions
  add column expiry_reminder_sent_at timestamptz;
