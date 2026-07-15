-- Removes categories.is_visible — dropped from scope 2026-07-13 (see
-- planning/04_data-model.md's "not in scope" note). The column was already
-- edited out of 20260710015525_initial_schema.sql on disk, but that edit
-- never re-ran against the already-applied hapag-dev database, so the
-- column and its RLS policy were still live there. This migration makes
-- the actual schema match the migration file.

-- Drop both possible policy names: the old one (still live on databases that
-- only ran the original 20260710015525 migration before it was edited) and
-- the current one (already created there on any fresh `supabase db reset`,
-- since that migration file now creates it directly) — so this migration is
-- safe to run regardless of which state a given database is in.
drop policy if exists "public can read visible categories of active businesses" on categories;
drop policy if exists "public can read categories of active businesses" on categories;

create policy "public can read categories of active businesses"
  on categories for select
  using (
    exists (
      select 1 from businesses
      where businesses.id = categories.business_id
        and businesses.status = 'active'
    )
  );

alter table categories drop column if exists is_visible;
