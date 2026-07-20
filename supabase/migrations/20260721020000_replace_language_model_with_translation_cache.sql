-- Instant Translate — per planning/added-feature/02_instant-translate.md
-- Replaces the MVP's binary owner-typed lang1/lang2 model with:
--   one owner-authored source-language text (name/description — see
--   20260721030000_rename_source_fields.sql for the name_lang1/
--   description_lang1 -> name/description rename) + a DeepL translation
--   cache generated on save.
-- source_language is source-only — Tagalog (fil) is never a translation
-- target, only en/ko/ja/zh are (see Decisions Log in the doc above).

create type source_language as enum ('en', 'fil');
create type display_language as enum ('en', 'ko', 'ja', 'zh');

alter table businesses add column source_language source_language not null default 'en';
alter table businesses drop column language;
drop type language_pref;

alter table items drop column name_lang2;
alter table items drop column description_lang2;
alter table categories drop column name_lang2;

-- ============================================================
-- item_translations
-- ============================================================

create table item_translations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  language_code display_language not null,
  translated_name text,
  translated_description text,
  source_hash text not null,
  translated_at timestamptz not null default now(),
  unique (item_id, language_code)
);

create index on item_translations (item_id);
create index on item_translations (business_id);

-- ============================================================
-- category_translations
-- ============================================================

create table category_translations (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  language_code display_language not null,
  translated_name text,
  source_hash text not null,
  translated_at timestamptz not null default now(),
  unique (category_id, language_code)
);

create index on category_translations (category_id);
create index on category_translations (business_id);

-- ============================================================
-- RLS — same business_id-scoped pattern as items/categories
-- ============================================================

alter table item_translations enable row level security;
alter table category_translations enable row level security;

create policy "owners can manage own item translations"
  on item_translations for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));

create policy "admins can read all item translations"
  on item_translations for select
  using (is_admin());

create policy "public can read item translations of active businesses"
  on item_translations for select
  using (
    exists (
      select 1 from businesses
      where businesses.id = item_translations.business_id
        and businesses.status = 'active'
    )
  );

create policy "owners can manage own category translations"
  on category_translations for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));

create policy "admins can read all category translations"
  on category_translations for select
  using (is_admin());

create policy "public can read category translations of active businesses"
  on category_translations for select
  using (
    exists (
      select 1 from businesses
      where businesses.id = category_translations.business_id
        and businesses.status = 'active'
    )
  );
