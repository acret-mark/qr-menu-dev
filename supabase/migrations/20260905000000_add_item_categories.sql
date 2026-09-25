-- ============================================================
-- item_categories — many-to-many item <-> category, replacing
-- items.category_id (spec 035-item-multiple-categories)
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

-- Drop the now-superseded single-category FK (and its cascade — item
-- deletion on category delete becomes explicit application logic instead,
-- see deleteCategory() in src/lib/categories/actions.ts, FR-006/FR-007) and
-- items.sort_order (position is now tracked per (item, category) link on
-- item_categories.sort_order, FR-005).
alter table items drop column category_id;
alter table items drop column sort_order;

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
