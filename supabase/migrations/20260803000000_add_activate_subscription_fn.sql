create function activate_subscription(
  p_subscription_id uuid,
  p_admin_id uuid,
  p_plan plan_type,
  p_starts_at timestamptz,
  p_expires_at timestamptz
)
returns subscriptions
language plpgsql
security definer
as $$
declare
  v_business_id uuid;
  v_subscription subscriptions;
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;

  update subscriptions
    set status = 'active',
        plan = p_plan,
        activated_by = p_admin_id,
        activated_at = now(),
        starts_at = p_starts_at,
        expires_at = p_expires_at
    where id = p_subscription_id
      and status = 'pending'
    returning business_id into v_business_id;

  if v_business_id is null then
    return null; -- already non-pending; caller renders the already-active state
  end if;

  update businesses set status = 'active' where id = v_business_id;

  select * into v_subscription from subscriptions where id = p_subscription_id;
  return v_subscription;
end;
$$;

grant execute on function activate_subscription(uuid, uuid, plan_type, timestamptz, timestamptz) to authenticated;
