-- StudyBench — content datastore foundation.
--
-- This is the first step of moving question content out of the client bundle and
-- behind the server. Today content is generated/curated in TypeScript and shipped
-- to the browser, which (a) bloats the bundle and (b) makes premium content
-- readable by anyone who inspects the JS. This table lets content be stored,
-- reviewed, and served with the premium gate enforced at the data layer.
--
-- IMPORTANT: additive and non-breaking. Nothing reads this table yet — the
-- existing code-based content path is untouched. Content is migrated in and the
-- serving path switched over incrementally (see docs/OPERATIONS.md).
--
-- Apply with:  supabase db push   (or paste into the Supabase SQL editor)

create table if not exists public.content_questions (
  id           text primary key,
  section      text not null,                       -- quant | reasoning | verbal | coding | cs-core | comm-interview
  company_id   text,                                -- optional company scoping; null = general
  topic        text not null default '',
  difficulty   text not null default 'medium',      -- easy | medium | hard
  prompt       text not null,
  options      jsonb   not null default '[]'::jsonb,
  answer       integer not null,
  explanation  text    not null default '',
  option_notes jsonb,                                -- per-option rationale (flagship layer); parallel to options
  source_id    text,
  curated      boolean not null default false,
  -- The gate: 'free' rows are readable by anyone via RLS; 'premium' rows are
  -- never exposed through the anon/authenticated client and can only be served
  -- by a server route that has already passed requirePremium() (service role).
  tier         text not null default 'premium',     -- free | premium
  status       text not null default 'draft',       -- draft | reviewed | live | retired
  created_by   uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint content_questions_tier_check   check (tier   in ('free', 'premium')),
  constraint content_questions_status_check check (status in ('draft', 'reviewed', 'live', 'retired'))
);

alter table public.content_questions enable row level security;

-- Read path: clients may read only LIVE + FREE questions. Premium and non-live
-- rows are invisible to the anon/authenticated roles, so premium content is not
-- leaked through PostgREST — it must be served by a server route after an
-- entitlement check. Writes have no policy, so only the service role can mutate.
drop policy if exists "content_questions read live free" on public.content_questions;
create policy "content_questions read live free" on public.content_questions
  for select to anon, authenticated
  using (status = 'live' and tier = 'free');

-- Serving hot paths: by section/tier/status, and company-scoped lookups.
create index if not exists idx_content_questions_section
  on public.content_questions (section, status, tier);
create index if not exists idx_content_questions_company
  on public.content_questions (company_id, status, tier);

-- Keep updated_at fresh (reuses the shared trigger function from 0005).
drop trigger if exists trg_content_questions_updated_at on public.content_questions;
create trigger trg_content_questions_updated_at
  before update on public.content_questions
  for each row execute function public.set_updated_at();
