-- Unified Subscription Lifecycle (specs/032-unified-subscription-lifecycle).
--
-- Trial grants get their own function rather than overloading
-- activate_subscription(), which assumes an existing *pending* row created
-- by the owner's payment-proof submission (with an amount and proof URL).
-- A trial grant has neither: it's admin-initiated from nothing, with no
-- payment. This mirrors setBusinessStatusAndPlan()'s admin-judgment path
-- (Constitution Principle II clarifications) but now writes a real
-- subscriptions row so subscriptions.expires_at becomes the sole expiry
-- source of truth (businesses.trial_ends_at stays, deprecated, unwritten).
create function grant_trial_subscription(
  p_business_id uuid,
  p_admin_id uuid,
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

  insert into subscriptions (
    business_id, plan, amount, status, activated_by, activated_at, starts_at, expires_at
  )
  values (
    p_business_id, 'trial', 0, 'active', p_admin_id, now(), now(), p_expires_at
  )
  returning * into v_subscription;

  update businesses set status = 'trial' where id = p_business_id;

  return v_subscription;
end;
$$;

grant execute on function grant_trial_subscription(uuid, uuid, timestamptz) to authenticated;
