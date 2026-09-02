-- Unified Subscription Lifecycle (specs/032-unified-subscription-lifecycle).
-- Widens plan_type so a subscriptions row can represent a trial grant
-- directly, instead of trial state living only on businesses.status with
-- no linked subscription row. Must be its own migration/transaction: a
-- newly added enum value cannot be used by a later statement in the same
-- transaction that adds it.
alter type plan_type add value if not exists 'trial';
