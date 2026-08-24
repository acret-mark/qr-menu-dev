drop policy "public can read active businesses" on businesses;
create policy "public can read active businesses"
  on businesses for select
  using (status in ('active', 'trial'));

drop policy "public can read categories of active businesses" on categories;
create policy "public can read categories of active businesses"
  on categories for select
  using (
    exists (
      select 1 from businesses
      where businesses.id = categories.business_id
        and businesses.status in ('active', 'trial')
    )
  );

drop policy "public can read displayed items of active businesses" on items;
create policy "public can read displayed items of active businesses"
  on items for select
  using (
    is_displayed
    and exists (
      select 1 from businesses
      where businesses.id = items.business_id
        and businesses.status in ('active', 'trial')
    )
  );
