-- Menu Item Ingredients — per specs/030-menu-item-ingredients/schema-change-request.md
-- (ai_workspace). Adds a per-business ingredient vocabulary plus the item <-> ingredient
-- many-to-many join. Follows the item_translations/category_translations RLS convention
-- (owner manage own / admin read all / public read active-or-trial-business rows), using
-- the widened `status in ('active', 'trial')` check already established by
-- 20260824010000_widen_public_menu_visibility_to_trial.sql.

-- ============================================================
-- ingredients — per-business vocabulary, Drupal-taxonomy-like
-- ============================================================

create table ingredients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index on ingredients (business_id);

-- Case-insensitive dedupe (FR-005) enforced at the data layer. A plain table-
-- level `unique (...)` constraint can't take an expression like `lower(name)`
-- — that requires a genuine unique index instead.
create unique index ingredients_business_id_lower_name_idx on ingredients (business_id, lower(name));

-- ============================================================
-- item_ingredients — many-to-many item <-> ingredient
-- ============================================================

create table item_ingredients (
  item_id uuid not null references items (id) on delete cascade,
  ingredient_id uuid not null references ingredients (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (item_id, ingredient_id)
);

create index on item_ingredients (item_id);
create index on item_ingredients (ingredient_id);
create index on item_ingredients (business_id);

-- ============================================================
-- RLS — same three-policy convention as item_translations/category_translations
-- ============================================================

alter table ingredients enable row level security;
alter table item_ingredients enable row level security;

create policy "owners can manage own ingredients"
  on ingredients for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));

create policy "admins can read all ingredients"
  on ingredients for select
  using (is_admin());

create policy "public can read ingredients of active businesses"
  on ingredients for select
  using (
    exists (
      select 1 from businesses
      where businesses.id = ingredients.business_id
        and businesses.status in ('active', 'trial')
    )
  );

create policy "owners can manage own item ingredients"
  on item_ingredients for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));

create policy "admins can read all item ingredients"
  on item_ingredients for select
  using (is_admin());

create policy "public can read item ingredients of displayed items of active businesses"
  on item_ingredients for select
  using (
    exists (
      select 1 from items
      join businesses on businesses.id = items.business_id
      where items.id = item_ingredients.item_id
        and items.is_displayed
        and businesses.status in ('active', 'trial')
    )
  );
