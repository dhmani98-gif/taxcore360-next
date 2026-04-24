-- Manual schema update for TaxCore360 (Supabase)
-- Adds: Base tables (companies, vendors, users), Vault documents, W-9 intake (invites/submissions), Subscriptions
-- Safe to run multiple times (uses IF NOT EXISTS where possible)

begin;

-- =========================
-- Base Tables
-- =========================

-- Companies table
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

-- Vendors table
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

-- Users table
create table if not exists public.users (
  id text primary key,
  email text not null unique,
  name text not null,
  role text default 'USER',
  supabaseUid text unique,
  companyId text,
  isActive boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_supabaseUid_idx on public.users(supabaseUid);
create index if not exists users_companyId_idx on public.users(companyId);

alter table public.users
  drop constraint if exists users_companyId_fkey;

alter table public.users
  add constraint users_companyId_fkey
  foreign key (companyId)
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

-- Create triggers for tables with updated_at
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

-- Triggers for other tables will be added after table creation

-- =========================
-- Enums
-- =========================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'document_category') then
    create type document_category as enum (
      'W9',
      'INVOICE',
      'CONTRACT',
      'RECEIPT',
      'TAX_DOCUMENT',
      'CORRESPONDENCE',
      'COMPLIANCE',
      'OTHER'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'w9_invite_status') then
    create type w9_invite_status as enum (
      'SENT',
      'VIEWED',
      'COMPLETED',
      'EXPIRED',
      'CANCELED'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'w9_approval_status') then
    create type w9_approval_status as enum (
      'PENDING',
      'APPROVED',
      'REJECTED'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'subscription_interval') then
    create type subscription_interval as enum (
      'MONTHLY',
      'ANNUAL'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type subscription_status as enum (
      'ACTIVE',
      'PAST_DUE',
      'CANCELED',
      'INCOMPLETE',
      'TRIALING'
    );
  end if;
end $$;

-- =========================
-- Vault Documents
-- =========================

create table if not exists public.vault_documents (
  id text primary key,

  category document_category not null,
  document_name text not null,
  notes text,

  file_url text not null,
  file_type text not null,
  file_size integer not null,
  storage_path text not null,

  company_id text not null,
  vendor_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vault_documents_company_category_created_at_idx
  on public.vault_documents (company_id, category, created_at);

create index if not exists vault_documents_vendor_created_at_idx
  on public.vault_documents (vendor_id, created_at);

alter table public.vault_documents
  drop constraint if exists vault_documents_company_id_fkey;

alter table public.vault_documents
  add constraint vault_documents_company_id_fkey
  foreign key (company_id)
  references public.companies(id)
  on delete cascade;

alter table public.vault_documents
  drop constraint if exists vault_documents_vendor_id_fkey;

alter table public.vault_documents
  add constraint vault_documents_vendor_id_fkey
  foreign key (vendor_id)
  references public.vendors(id)
  on delete set null;

-- Trigger for vault_documents
drop trigger if exists on_vault_documents_updated_at on public.vault_documents;
create trigger on_vault_documents_updated_at
  before update on public.vault_documents
  for each row execute function handle_updated_at();

-- =========================
-- W-9 Intake: Invites
-- =========================

create table if not exists public.w9_invites (
  id text primary key,
  token text not null,
  status w9_invite_status not null default 'SENT',

  vendor_email text,

  viewed_at timestamptz,
  completed_at timestamptz,

  company_id text not null,
  vendor_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null
);

create unique index if not exists w9_invites_token_key on public.w9_invites(token);
create index if not exists w9_invites_company_status_created_at_idx on public.w9_invites(company_id, status, created_at);
create index if not exists w9_invites_vendor_created_at_idx on public.w9_invites(vendor_id, created_at);

alter table public.w9_invites
  drop constraint if exists w9_invites_company_id_fkey;

alter table public.w9_invites
  add constraint w9_invites_company_id_fkey
  foreign key (company_id)
  references public.companies(id)
  on delete cascade;

alter table public.w9_invites
  drop constraint if exists w9_invites_vendor_id_fkey;

alter table public.w9_invites
  add constraint w9_invites_vendor_id_fkey
  foreign key (vendor_id)
  references public.vendors(id)
  on delete set null;

-- Trigger for w9_invites
drop trigger if exists on_w9_invites_updated_at on public.w9_invites;
create trigger on_w9_invites_updated_at
  before update on public.w9_invites
  for each row execute function handle_updated_at();

-- =========================
-- W-9 Intake: Submissions
-- =========================

create table if not exists public.w9_submissions (
  id text primary key,
  approval_status w9_approval_status not null default 'PENDING',

  legal_name text not null,
  email text,
  address text,
  state text,

  tax_id_type text not null,
  tax_id text not null,
  entity_type text not null,

  e_signed boolean not null default false,
  signature_name text,
  signature_date timestamptz,

  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  review_notes text,

  company_id text not null,
  vendor_id text,
  invite_id text not null
);

create index if not exists w9_submissions_company_status_submitted_at_idx
  on public.w9_submissions (company_id, approval_status, submitted_at);

create index if not exists w9_submissions_vendor_submitted_at_idx
  on public.w9_submissions (vendor_id, submitted_at);

create index if not exists w9_submissions_invite_id_idx
  on public.w9_submissions (invite_id);

alter table public.w9_submissions
  drop constraint if exists w9_submissions_company_id_fkey;

alter table public.w9_submissions
  add constraint w9_submissions_company_id_fkey
  foreign key (company_id)
  references public.companies(id)
  on delete cascade;

alter table public.w9_submissions
  drop constraint if exists w9_submissions_vendor_id_fkey;

alter table public.w9_submissions
  add constraint w9_submissions_vendor_id_fkey
  foreign key (vendor_id)
  references public.vendors(id)
  on delete set null;

alter table public.w9_submissions
  drop constraint if exists w9_submissions_invite_id_fkey;

alter table public.w9_submissions
  add constraint w9_submissions_invite_id_fkey
  foreign key (invite_id)
  references public.w9_invites(id)
  on delete cascade;

-- Trigger for w9_submissions
drop trigger if exists on_w9_submissions_updated_at on public.w9_submissions;
create trigger on_w9_submissions_updated_at
  before update on public.w9_submissions
  for each row execute function handle_updated_at();

-- =========================
-- Subscription Plans
-- =========================

create table if not exists public.subscription_plans (
  id text primary key,
  name text not null,
  price_cents integer not null,
  interval subscription_interval not null,
  is_active boolean not null default true,
  is_popular boolean not null default false,
  features jsonb not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger for subscription_plans
drop trigger if exists on_subscription_plans_updated_at on public.subscription_plans;
create trigger on_subscription_plans_updated_at
  before update on public.subscription_plans
  for each row execute function handle_updated_at();

-- =========================
-- Company Subscriptions
-- =========================

create table if not exists public.company_subscriptions (
  id text primary key,
  status subscription_status not null default 'ACTIVE',

  seats integer not null default 1,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,

  company_id text not null,
  plan_id text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists company_subscriptions_company_id_key
  on public.company_subscriptions(company_id);

create index if not exists company_subscriptions_status_period_end_idx
  on public.company_subscriptions(status, current_period_end);

alter table public.company_subscriptions
  drop constraint if exists company_subscriptions_company_id_fkey;

alter table public.company_subscriptions
  add constraint company_subscriptions_company_id_fkey
  foreign key (company_id)
  references public.companies(id)
  on delete cascade;

alter table public.company_subscriptions
  drop constraint if exists company_subscriptions_plan_id_fkey;

alter table public.company_subscriptions
  add constraint company_subscriptions_plan_id_fkey
  foreign key (plan_id)
  references public.subscription_plans(id);

-- Trigger for company_subscriptions
drop trigger if exists on_company_subscriptions_updated_at on public.company_subscriptions;
create trigger on_company_subscriptions_updated_at
  before update on public.company_subscriptions
  for each row execute function handle_updated_at();

commit;
