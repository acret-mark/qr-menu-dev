-- Initial schema for Hapag, per planning/04_data-model.md
-- Entities: businesses -> categories -> items, businesses -> subscriptions, businesses -> support_tickets

-- ============================================================
-- Enums
-- ============================================================

create type plan_type as enum ('standard', 'pro');
create type business_status as enum ('active', 'suspended', 'trial', 'pending');
create type subscription_status as enum ('pending', 'active', 'expired', 'cancelled');
create type ticket_status as enum ('open', 'in_progress', 'resolved');
create type language_pref as enum ('en', 'tl');

-- ============================================================
-- admin_users
-- Internal ACRET staff. Not in 04_data-model.md's entity list, but required
-- because subscriptions.activated_by references an admin identity.
-- Rows are provisioned manually (service role) — no public self-signup.
-- ============================================================

create table admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- businesses
-- ============================================================

create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  contact_phone text,
  contact_email text,
  address text,
  owner_id uuid not null references auth.users (id) on delete cascade,
  plan plan_type not null default 'standard',
  status business_status not null default 'pending',
  language language_pref not null default 'en',
  created_at timestamptz not null default now()
);

create unique index on businesses (slug);

-- ============================================================
-- categories
-- ============================================================

create table categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  name_en text not null,
  name_tl text,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index on categories (business_id);

-- ============================================================
-- items
-- ============================================================

create table items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  name_en text not null,
  name_tl text,
  description_en text,
  description_tl text,
  price numeric(10, 2) not null,
  photo_url text,
  is_available boolean not null default true,
  is_sold_out boolean not null default false,
  is_best_seller boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index on items (business_id);
create index on items (category_id);

-- ============================================================
-- subscriptions
-- ============================================================

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  plan plan_type not null,
  amount numeric(10, 2) not null,
  status subscription_status not null default 'pending',
  payment_method text,
  payment_proof_url text,
  activated_by uuid references admin_users (id),
  activated_at timestamptz,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index on subscriptions (business_id);

-- ============================================================
-- support_tickets
-- ============================================================

create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  subject text not null,
  message text not null,
  status ticket_status not null default 'open',
  created_at timestamptz not null default now()
);

create index on support_tickets (business_id);

-- ============================================================
-- RLS helper functions
-- ============================================================

create function is_business_owner(target_business_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from businesses
    where id = target_business_id
      and owner_id = auth.uid()
  );
$$;

create function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from admin_users
    where id = auth.uid()
  );
$$;

-- ============================================================
-- RLS policies
-- Owners: full CRUD on their own business and its children.
-- Admins: full read on everything, write access to admin-owned fields
--   (subscription activation, ticket status).
-- Public (anon): read-only access to active businesses' visible menu content.
-- ============================================================

alter table admin_users enable row level security;
alter table businesses enable row level security;
alter table categories enable row level security;
alter table items enable row level security;
alter table subscriptions enable row level security;
alter table support_tickets enable row level security;

-- admin_users: admins can see the admin roster; no public/owner access.
create policy "admins can read admin_users"
  on admin_users for select
  using (is_admin());

-- businesses
create policy "owners can read own business"
  on businesses for select
  using (owner_id = auth.uid());

create policy "owners can insert own business"
  on businesses for insert
  with check (owner_id = auth.uid());

create policy "owners can update own business"
  on businesses for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "admins can read all businesses"
  on businesses for select
  using (is_admin());

create policy "admins can update all businesses"
  on businesses for update
  using (is_admin())
  with check (is_admin());

create policy "public can read active businesses"
  on businesses for select
  using (status = 'active');

-- categories
create policy "owners can manage own categories"
  on categories for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));

create policy "admins can read all categories"
  on categories for select
  using (is_admin());

create policy "public can read visible categories of active businesses"
  on categories for select
  using (
    is_visible
    and exists (
      select 1 from businesses
      where businesses.id = categories.business_id
        and businesses.status = 'active'
    )
  );

-- items
create policy "owners can manage own items"
  on items for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));

create policy "admins can read all items"
  on items for select
  using (is_admin());

create policy "public can read available items of active businesses"
  on items for select
  using (
    is_available
    and exists (
      select 1 from businesses
      where businesses.id = items.business_id
        and businesses.status = 'active'
    )
  );

-- subscriptions
create policy "owners can read own subscriptions"
  on subscriptions for select
  using (is_business_owner(business_id));

create policy "owners can insert own subscriptions"
  on subscriptions for insert
  with check (is_business_owner(business_id));

create policy "admins can read all subscriptions"
  on subscriptions for select
  using (is_admin());

create policy "admins can update all subscriptions"
  on subscriptions for update
  using (is_admin())
  with check (is_admin());

-- support_tickets
create policy "owners can manage own support tickets"
  on support_tickets for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));

create policy "admins can read all support tickets"
  on support_tickets for select
  using (is_admin());

create policy "admins can update all support tickets"
  on support_tickets for update
  using (is_admin())
  with check (is_admin());
