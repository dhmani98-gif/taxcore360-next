-- Row Level Security (RLS) Policies for TaxCore360
-- Enables RLS and creates policies for W-9 invites, W-9 submissions, and vault documents
-- Safe to run multiple times

begin;

-- =========================
-- W9 Invites RLS
-- =========================

alter table public.w9_invites enable row level security;

drop policy if exists "Users can view their company W9 invites" on public.w9_invites;
create policy "Users can view their company W9 invites" on public.w9_invites
  for select using (auth.uid()::text in (
    select "supabaseUid" from public.users where "company_id" = public.w9_invites.company_id
  ));

drop policy if exists "Users can create W9 invites for their company" on public.w9_invites;
create policy "Users can create W9 invites for their company" on public.w9_invites
  for insert with check (auth.uid()::text in (
    select "supabaseUid" from public.users where "company_id" = public.w9_invites.company_id
  ));

-- =========================
-- W9 Submissions RLS
-- =========================

alter table public.w9_submissions enable row level security;

drop policy if exists "Users can view their company W9 submissions" on public.w9_submissions;
create policy "Users can view their company W9 submissions" on public.w9_submissions
  for select using (auth.uid()::text in (
    select "supabaseUid" from public.users where "company_id" = public.w9_submissions.company_id
  ));

drop policy if exists "Users can create W9 submissions for their company" on public.w9_submissions;
create policy "Users can create W9 submissions for their company" on public.w9_submissions
  for insert with check (auth.uid()::text in (
    select "supabaseUid" from public.users where "company_id" = public.w9_submissions.company_id
  ));

drop policy if exists "Users can update W9 submissions for their company" on public.w9_submissions;
create policy "Users can update W9 submissions for their company" on public.w9_submissions
  for update using (auth.uid()::text in (
    select "supabaseUid" from public.users where "company_id" = public.w9_submissions.company_id
  ));

-- =========================
-- Vault Documents RLS
-- =========================

alter table public.vault_documents enable row level security;

drop policy if exists "Users can view their company vault documents" on public.vault_documents;
create policy "Users can view their company vault documents" on public.vault_documents
  for select using (auth.uid()::text in (
    select "supabaseUid" from public.users where "company_id" = public.vault_documents.company_id
  ));

drop policy if exists "Users can create vault documents for their company" on public.vault_documents;
create policy "Users can create vault documents for their company" on public.vault_documents
  for insert with check (auth.uid()::text in (
    select "supabaseUid" from public.users where "company_id" = public.vault_documents.company_id
  ));

drop policy if exists "Users can update vault documents for their company" on public.vault_documents;
create policy "Users can update vault documents for their company" on public.vault_documents
  for update using (auth.uid()::text in (
    select "supabaseUid" from public.users where "company_id" = public.vault_documents.company_id
  ));

drop policy if exists "Users can delete vault documents for their company" on public.vault_documents;
create policy "Users can delete vault documents for their company" on public.vault_documents
  for delete using (auth.uid()::text in (
    select "supabaseUid" from public.users where "company_id" = public.vault_documents.company_id
  ));

commit;
