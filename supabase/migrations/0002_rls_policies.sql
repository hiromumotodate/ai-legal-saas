-- Row Level Security: every table scoped to organization_id of the authenticated user.

-- Helper: return the caller's organization_id from profiles
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

-- ============================================================
-- Enable RLS
-- ============================================================
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.evidence enable row level security;
alter table public.timeline_events enable row level security;
alter table public.documents enable row level security;
alter table public.citations enable row level security;
alter table public.usage_events enable row level security;

-- ============================================================
-- organizations: members can read their own org, owners/admins can update
-- ============================================================
create policy "org_select_own" on public.organizations
  for select using (id = public.current_org_id());

create policy "org_update_by_admin" on public.organizations
  for update using (
    id = public.current_org_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner','admin')
    )
  );

-- ============================================================
-- profiles: users see members of their org; update only own profile
-- ============================================================
create policy "profile_select_same_org" on public.profiles
  for select using (organization_id = public.current_org_id());

create policy "profile_insert_self" on public.profiles
  for insert with check (id = auth.uid());

create policy "profile_update_self" on public.profiles
  for update using (id = auth.uid());

-- ============================================================
-- cases: scoped to org
-- ============================================================
create policy "cases_select_own_org" on public.cases
  for select using (organization_id = public.current_org_id());
create policy "cases_insert_own_org" on public.cases
  for insert with check (organization_id = public.current_org_id());
create policy "cases_update_own_org" on public.cases
  for update using (organization_id = public.current_org_id());
create policy "cases_delete_own_org" on public.cases
  for delete using (organization_id = public.current_org_id());

-- ============================================================
-- evidence: scoped to org
-- ============================================================
create policy "evidence_select_own_org" on public.evidence
  for select using (organization_id = public.current_org_id());
create policy "evidence_insert_own_org" on public.evidence
  for insert with check (organization_id = public.current_org_id());
create policy "evidence_update_own_org" on public.evidence
  for update using (organization_id = public.current_org_id());
create policy "evidence_delete_own_org" on public.evidence
  for delete using (organization_id = public.current_org_id());

-- ============================================================
-- timeline_events
-- ============================================================
create policy "timeline_select_own_org" on public.timeline_events
  for select using (organization_id = public.current_org_id());
create policy "timeline_insert_own_org" on public.timeline_events
  for insert with check (organization_id = public.current_org_id());
create policy "timeline_update_own_org" on public.timeline_events
  for update using (organization_id = public.current_org_id());
create policy "timeline_delete_own_org" on public.timeline_events
  for delete using (organization_id = public.current_org_id());

-- ============================================================
-- documents
-- ============================================================
create policy "documents_select_own_org" on public.documents
  for select using (organization_id = public.current_org_id());
create policy "documents_insert_own_org" on public.documents
  for insert with check (organization_id = public.current_org_id());
create policy "documents_update_own_org" on public.documents
  for update using (organization_id = public.current_org_id());
create policy "documents_delete_own_org" on public.documents
  for delete using (organization_id = public.current_org_id());

-- ============================================================
-- citations
-- ============================================================
create policy "citations_select_own_org" on public.citations
  for select using (organization_id = public.current_org_id());
create policy "citations_insert_own_org" on public.citations
  for insert with check (organization_id = public.current_org_id());
create policy "citations_delete_own_org" on public.citations
  for delete using (organization_id = public.current_org_id());

-- ============================================================
-- usage_events: read-only for users (inserted via service role)
-- ============================================================
create policy "usage_select_own_org" on public.usage_events
  for select using (organization_id = public.current_org_id());
