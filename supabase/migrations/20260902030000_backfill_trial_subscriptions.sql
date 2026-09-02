-- Unified Subscription Lifecycle (specs/032-unified-subscription-lifecycle).
--
-- Backfills a subscriptions row for every business currently on `trial`
-- status with no subscriptions row at all, so the unified expiry cron has
-- something to read for them too.
--
-- Note: businesses.trial_ends_at turned out to be a dead column in
-- practice (grepped application code at authoring time: nothing ever wrote
-- it — the grantTrial() action that used to set it was removed and
-- setBusinessStatusAndPlan() never touched it). So it cannot be trusted as
-- the real trial start/expiry record here. Where it happens to be set, it's
-- honored; otherwise this falls back to the same "one calendar month"
-- reference window Constitution Principle II's trial-grant clarification
-- already established for admin-granted trials, anchored at the business's
-- created_at as the best available proxy for grant time.
insert into subscriptions (business_id, plan, amount, status, activated_at, starts_at, expires_at)
select
  b.id,
  'trial',
  0,
  'active',
  b.created_at,
  b.created_at,
  coalesce(b.trial_ends_at, b.created_at + interval '1 month')
from businesses b
where b.status = 'trial'
  and not exists (
    select 1 from subscriptions s where s.business_id = b.id
  );
