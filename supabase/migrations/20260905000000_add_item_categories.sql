-- ============================================================
-- item_categories — many-to-many item <-> category, replacing
-- items.category_id (spec 035-item-multiple-categories)
--
-- EXPAND phase of an expand/contract deploy (see deployment plan,
-- specs/035-item-multiple-categories/): purely additive — item_categories
-- is created and backfilled, but items.category_id/sort_order are left in
-- place. Safe to apply to production independently of the app deploy: old
-- app code (which only reads/writes items.category_id/sort_order) is
-- completely unaffected, since nothing it depends on is touched. The
-- CONTRACT phase (dropping those two columns, once new app code — which
-- reads/writes item_categories exclusively — has been live and stable for
-- a bake-in period) is a separate, later migration:
-- 20260912000000_drop_items_category_id_sort_order.sql.
-- ============================================================

create table item_categories (
  item_id uuid not null references items (id) on delete cascade,
  category_id uuid not null references categories (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  primary key (item_id, category_id)
);

create index on item_categories (item_id);
create index on item_categories (category_id);
create index on item_categories (business_id);

-- Backfill: every existing item's current single category and position
-- becomes its first (and, until an owner adds more, only) item_categories
-- row — no owner action required (spec 035-item-multiple-categories,
-- Assumptions; SC-005). A no-op against a freshly-created local dev DB
-- (this migration runs before seed.sql populates `items`), load-bearing
-- against production/staging, where `items` already has real rows.
insert into item_categories (item_id, category_id, business_id, sort_order)
select id, category_id, business_id, sort_order from items;

-- items.category_id/items.sort_order are intentionally NOT dropped here —
-- see the CONTRACT-phase migration note above. Two changes ARE needed here,
-- though, so new app code (which never sets category_id — it writes
-- item_categories instead) works correctly for the whole bake-in period
-- between this migration landing and the CONTRACT migration:
--
-- 1. Drop NOT NULL on category_id: new app code's item insert doesn't set
--    it, and it has no default. Without this, every "Add Item" would fail
--    with a not-null violation from the moment new app code goes live.
-- 2. Drop the category_id -> categories FK's ON DELETE CASCADE
--    (`items_category_id_fkey`, declared inline in
--    20260710015525_initial_schema.sql:70, so this is Postgres's default
--    auto-generated constraint name): with this cascade still active,
--    deleting a category would keep auto-deleting every item whose
--    (now-frozen, no-longer-maintained) category_id equals it — including
--    items that item_categories says should survive via another category —
--    silently undermining deleteCategory()'s new FR-006/FR-007 orphan-only
--    logic for the entire bake-in period, not just a brief window. Dropping
--    just the constraint (not the column) leaves category_id itself as
--    inert historical data old app code can still read from, with no
--    enforcement tying it to category deletion any more.
--
-- Old app code (if still running briefly between this migration landing and
-- the app deploy) is otherwise unaffected: it never triggers the removed
-- NOT NULL check (it still always sets category_id itself), and its own
-- deleteCategory() — which has no item-deletion logic of its own, relying
-- entirely on the now-removed cascade — degrades to leaving that category's
-- items behind (orphaned, invisible on every category tab, but not deleted)
-- rather than deleting them; acceptable given this window is kept short by
-- deploying the app immediately after this migration (see deployment plan).
alter table items drop constraint items_category_id_fkey;
alter table items alter column category_id drop not null;

-- ============================================================
-- RLS — same three-policy convention as item_ingredients
-- ============================================================

alter table item_categories enable row level security;

create policy "owners can manage own item categories"
  on item_categories for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));

create policy "admins can read all item categories"
  on item_categories for select
  using (is_admin());

create policy "public can read item categories of displayed items of active businesses"
  on item_categories for select
  using (
    exists (
      select 1 from items
      join businesses on businesses.id = items.business_id
      where items.id = item_categories.item_id
        and items.is_displayed
        and businesses.status in ('active', 'trial')
    )
  );
