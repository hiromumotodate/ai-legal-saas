-- Legal AI — Initial multi-tenant schema
-- Each law firm = organization. Users belong to one org.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- organizations (tenant)
-- ============================================================
create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  plan text not null default 'trial' check (plan in ('trial','starter','pro','enterprise')),
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_organizations_slug on public.organizations(slug);
create index idx_organizations_stripe_customer on public.organizations(stripe_customer_id);

-- ============================================================
-- profiles (user-to-org mapping, extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_org on public.profiles(organization_id);

-- ============================================================
-- cases (案件)
-- ============================================================
create table public.cases (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  case_number text,
  client_name text,
  court_name text,
  case_type text,
  status text not null default 'active' check (status in ('active','closed','archived')),
  side text check (side in ('plaintiff','defendant','third_party')),
  opposing_party text,
  description text,
  amount_in_dispute numeric,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_cases_org on public.cases(organization_id);
create index idx_cases_status on public.cases(status);

-- ============================================================
-- evidence (証拠)
-- ============================================================
create table public.evidence (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references public.cases(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  label text not null,
  evidence_type text check (evidence_type in ('contract','email','document','testimony','other')),
  storage_path text,
  content_text text,
  ai_summary text,
  ai_key_points jsonb,
  submitted_by text check (submitted_by in ('us','opposing','court')),
  submitted_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_evidence_case on public.evidence(case_id);
create index idx_evidence_org on public.evidence(organization_id);

-- ============================================================
-- timeline_events (タイムライン)
-- ============================================================
create table public.timeline_events (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references public.cases(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_date date not null,
  title text not null,
  description text,
  source text,
  evidence_id uuid references public.evidence(id) on delete set null,
  ai_generated boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_timeline_case on public.timeline_events(case_id);
create index idx_timeline_date on public.timeline_events(event_date);

-- ============================================================
-- documents (書面ドラフト)
-- ============================================================
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references public.cases(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  document_type text check (document_type in ('complaint','answer','brief','motion','agreement','other')),
  content text,
  ai_generated boolean not null default false,
  status text not null default 'draft' check (status in ('draft','final','submitted')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_documents_case on public.documents(case_id);

-- ============================================================
-- citations (判例検索結果)
-- ============================================================
create table public.citations (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid references public.cases(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  court text,
  case_number text,
  date date,
  summary text,
  relevance_score numeric,
  ai_reasoning text,
  created_at timestamptz not null default now()
);

create index idx_citations_case on public.citations(case_id);

-- ============================================================
-- usage_events (AI API 使用量トラッキング)
-- ============================================================
create table public.usage_events (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  feature text not null,
  tokens_input integer,
  tokens_output integer,
  cost_usd numeric,
  created_at timestamptz not null default now()
);

create index idx_usage_org_date on public.usage_events(organization_id, created_at desc);

-- ============================================================
-- Triggers: updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger organizations_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger cases_updated_at before update on public.cases
  for each row execute function public.set_updated_at();
create trigger evidence_updated_at before update on public.evidence
  for each row execute function public.set_updated_at();
create trigger documents_updated_at before update on public.documents
  for each row execute function public.set_updated_at();
