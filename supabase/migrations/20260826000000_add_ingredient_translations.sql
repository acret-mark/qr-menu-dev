-- Ingredient Translation — extends Instant Translate (20260721020000) to
-- ingredient names. 030-menu-item-ingredients explicitly deferred bilingual
-- ingredient support ("can be added later as its own explicit change"); this
-- is that change. Mirrors category_translations exactly (ingredients are a
-- shared, per-business vocabulary, same shape as categories — not per-item
-- text like item_translations.translated_description), keyed by
-- ingredient_id, using the same status in ('active', 'trial') public-read
-- gate already established for `ingredients` itself by
-- 20260825000000_add_ingredients.sql.

create table ingredient_translations (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references ingredients (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  language_code display_language not null,
  translated_name text,
  source_hash text not null,
  translated_at timestamptz not null default now(),
  unique (ingredient_id, language_code)
);

create index on ingredient_translations (ingredient_id);
create index on ingredient_translations (business_id);

alter table ingredient_translations enable row level security;

create policy "owners can manage own ingredient translations"
  on ingredient_translations for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));

create policy "admins can read all ingredient translations"
  on ingredient_translations for select
  using (is_admin());

create policy "public can read ingredient translations of active businesses"
  on ingredient_translations for select
  using (
    exists (
      select 1 from businesses
      where businesses.id = ingredient_translations.business_id
        and businesses.status in ('active', 'trial')
    )
  );
