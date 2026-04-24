-- Subscription Plans and Company Subscriptions for TaxCore360
-- Creates: subscription_interval enum, subscription_status enum, subscription_plans, company_subscriptions
-- Safe to run multiple times

begin;

-- =========================
-- Enums
-- =========================

do $$
begin
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

drop trigger if exists on_company_subscriptions_updated_at on public.company_subscriptions;
create trigger on_company_subscriptions_updated_at
  before update on public.company_subscriptions
  for each row execute function handle_updated_at();

commit;
