-- Base tables for TaxCore360
-- Creates: companies, vendors, users
-- Safe to run multiple times

begin;

-- =========================
-- Companies table
-- =========================

create table if not exists public.companies (
  id text primary key,
  legal_name text not null,
  ein text not null,
  address text,
  city text,
  state text,
  zip text,
  country text default 'USA',
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists companies_ein_idx on public.companies(ein);

-- =========================
-- Vendors table
-- =========================

create table if not exists public.vendors (
  id text primary key,
  name text not null,
  tin text,
  address text,
  city text,
  state text,
  zip text,
  email text,
  phone text,
  company_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vendors_company_id_idx on public.vendors(company_id);
create index if not exists vendors_tin_idx on public.vendors(tin);

alter table public.vendors
  drop constraint if exists vendors_company_id_fkey;

alter table public.vendors
  add constraint vendors_company_id_fkey
  foreign key (company_id)
  references public.companies(id)
  on delete cascade;

-- =========================
-- Users table
-- =========================

create table if not exists public.users (
  id text primary key,
  email text not null unique,
  name text not null,
  role text default 'USER',
  supabaseUid text unique,
  company_id text,
  isActive boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_supabaseUid_idx on public.users(supabaseUid);
create index if not exists users_company_id_idx on public.users(company_id);

alter table public.users
  drop constraint if exists users_company_id_fkey;

alter table public.users
  add constraint users_company_id_fkey
  foreign key (company_id)
  references public.companies(id)
  on delete cascade;

-- =========================
-- Updated At Trigger Function
-- =========================

create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for base tables
drop trigger if exists on_companies_updated_at on public.companies;
create trigger on_companies_updated_at
  before update on public.companies
  for each row execute function handle_updated_at();

drop trigger if exists on_vendors_updated_at on public.vendors;
create trigger on_vendors_updated_at
  before update on public.vendors
  for each row execute function handle_updated_at();

drop trigger if exists on_users_updated_at on public.users;
create trigger on_users_updated_at
  before update on public.users
  for each row execute function handle_updated_at();

commit;
