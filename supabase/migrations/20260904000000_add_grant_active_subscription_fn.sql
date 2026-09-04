-- Unified Subscription Lifecycle (specs/032-unified-subscription-lifecycle) follow-up.
--
-- Sibling to grant_trial_subscription() (T001,
-- 20260902020000_add_grant_trial_subscription_fn.sql), same admin-override
-- trust model extended to paid plans: an admin-declared renewal with no
-- payment proof, amount, or method attached — distinct from
-- activate_subscription(), which requires an existing *pending* row created
-- by the owner's own payment-proof submission. Used by
-- setBusinessStatusAndPlan()'s "Renew" path so that picking Active/plan on
-- a business with no currently-live subscription actually lifts the lock,
-- instead of only writing businesses.status/plan and leaving the stale
-- expired subscription row as the latest one the access gate reads.
create function grant_active_subscription(
  p_business_id uuid,
  p_admin_id uuid,
  p_plan plan_type,
  p_expires_at timestamptz
)
returns subscriptions
language plpgsql
security definer
as $$
declare
  v_subscription subscriptions;
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;

  if p_plan = 'trial' then
    raise exception 'use grant_trial_subscription for trial grants';
  end if;

  insert into subscriptions (
    business_id, plan, amount, status, activated_by, activated_at, starts_at, expires_at
  )
  values (
    p_business_id, p_plan, 0, 'active', p_admin_id, now(), now(), p_expires_at
  )
  returning * into v_subscription;

  update businesses set status = 'active', plan = p_plan where id = p_business_id;

  return v_subscription;
end;
$$;

grant execute on function grant_active_subscription(uuid, uuid, plan_type, timestamptz) to authenticated;
