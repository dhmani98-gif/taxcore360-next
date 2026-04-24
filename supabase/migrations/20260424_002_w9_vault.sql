-- W-9 Intake and Vault Documents for TaxCore360
-- Creates: document_category enum, vault_documents, w9_invites, w9_submissions
-- Safe to run multiple times

begin;

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

drop trigger if exists on_vault_documents_updated_at on public.vault_documents;
create trigger on_vault_documents_updated_at
  before update on public.vault_documents
  for each row execute function handle_updated_at();

-- =========================
-- W-9 Invites
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

drop trigger if exists on_w9_invites_updated_at on public.w9_invites;
create trigger on_w9_invites_updated_at
  before update on public.w9_invites
  for each row execute function handle_updated_at();

-- =========================
-- W-9 Submissions
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

drop trigger if exists on_w9_submissions_updated_at on public.w9_submissions;
create trigger on_w9_submissions_updated_at
  before update on public.w9_submissions
  for each row execute function handle_updated_at();

commit;
