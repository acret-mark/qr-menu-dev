-- Renames items.is_available to items.is_displayed to remove ambiguity with
-- is_sold_out — both read as "availability," which was confusing given they
-- control different things:
--   is_displayed: whether the item shows on the customer menu at all
--     (owner enable/disable, set only from the Add/Edit Item screen, O-08).
--   is_sold_out: whether an item that IS displayed shows as out of stock
--     ("Ubos Na") — item stays visible, just dimmed. This is the field the
--     quick "Available" toggle on O-07/O-08 actually controls (inverted:
--     toggle on = available to order = is_sold_out false).
--
-- This edit was made directly in 20260710015525_initial_schema.sql on disk,
-- but that file was already applied to hapag-dev before the edit — this
-- migration brings the actual remote schema in line with the migration
-- file, same pattern as the earlier is_visible and language-column fixes.

alter table items rename column is_available to is_displayed;

drop policy if exists "public can read available items of active businesses" on items;
drop policy if exists "public can read displayed items of active businesses" on items;

create policy "public can read displayed items of active businesses"
  on items for select
  using (
    is_displayed
    and exists (
      select 1 from businesses
      where businesses.id = items.business_id
        and businesses.status = 'active'
    )
  );
