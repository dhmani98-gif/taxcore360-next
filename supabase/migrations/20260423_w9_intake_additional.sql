-- Additional W-9 Intake tables and indexes for TaxCore360
-- Run after the main schema update to ensure proper relationships

begin;

-- Add indexes for better performance
create index if not exists w9_submissions_approval_status_idx on public.w9_submissions(approval_status);
create index if not exists w9_invites_vendor_id_idx on public.w9_invites(vendor_id);

-- Add unique constraint on invite tokens per company for security
create unique index if not exists w9_invites_company_token_key on public.w9_invites(company_id, token);

-- Add RLS policies (optional - remove if not using RLS)
-- These policies ensure users can only access their own company's data

-- W9 Invites policies
alter table public.w9_invites enable row level security;

create policy "Users can view their company W9 invites" on public.w9_invites
  for select using (auth.uid()::text in (
    select "supabaseUid" from public.users where "companyId" = public.w9_invites.company_id
  ));

create policy "Users can create W9 invites for their company" on public.w9_invites
  for insert with check (auth.uid()::text in (
    select "supabaseUid" from public.users where "companyId" = public.w9_invites.company_id
  ));

-- W9 Submissions policies
alter table public.w9_submissions enable row level security;

create policy "Users can view their company W9 submissions" on public.w9_submissions
  for select using (auth.uid()::text in (
    select "supabaseUid" from public.users where "companyId" = public.w9_submissions.company_id
  ));

create policy "Users can create W9 submissions for their company" on public.w9_submissions
  for insert with check (auth.uid()::text in (
    select "supabaseUid" from public.users where "companyId" = public.w9_submissions.company_id
  ));

create policy "Users can update W9 submissions for their company" on public.w9_submissions
  for update using (auth.uid()::text in (
    select "supabaseUid" from public.users where "companyId" = public.w9_submissions.company_id
  ));

-- Vault Documents policies
alter table public.vault_documents enable row level security;

create policy "Users can view their company vault documents" on public.vault_documents
  for select using (auth.uid()::text in (
    select "supabaseUid" from public.users where "companyId" = public.vault_documents.company_id
  ));

create policy "Users can create vault documents for their company" on public.vault_documents
  for insert with check (auth.uid()::text in (
    select "supabaseUid" from public.users where "companyId" = public.vault_documents.company_id
  ));

create policy "Users can update vault documents for their company" on public.vault_documents
  for update using (auth.uid()::text in (
    select "supabaseUid" from public.users where "companyId" = public.vault_documents.company_id
  ));

create policy "Users can delete vault documents for their company" on public.vault_documents
  for delete using (auth.uid()::text in (
    select "supabaseUid" from public.users where "companyId" = public.vault_documents.company_id
  ));

commit;
