-- StudyBench — initial schema + Row Level Security.
--
-- This migration is the version-controlled source of truth for the database
-- that lib/supabase/db.ts reads and writes. Every table is owned by exactly one
-- auth user and RLS ensures a user can only ever touch their own rows — this is
-- what makes the Privacy Policy's "each user can access only their own records"
-- statement true and enforceable (anon key + RLS is the only thing protecting
-- the data, since the client talks to PostgREST directly).
--
-- Apply with:  supabase db push   (or paste into the Supabase SQL editor)

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text,
  college    text,
  branch     text,
  grad_year  text,
  cgpa       text,
  backlogs   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- user_state  (xp, streak, entitlement, targets, gamification, topic accuracy)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.user_state (
  id                  uuid primary key references auth.users (id) on delete cascade,
  xp                  integer not null default 0,
  streak_count        integer not null default 0,
  streak_last_active  text,
  premium             boolean not null default false,
  primary_company     text    not null default 'general',
  interested          jsonb   not null default '[]'::jsonb,
  onboarded           boolean not null default false,
  topic_stats         jsonb   not null default '{}'::jsonb,
  badges              jsonb   not null default '[]'::jsonb,
  updated_at          timestamptz not null default now()
);

-- NOTE (entitlement hardening — do this when Razorpay goes live):
-- `premium` is currently writable by the owning user so the MVP's demo upgrade
-- toggle works. Before charging real money, revoke client UPDATE on this column
-- and flip `premium` only from a server route (service-role key) driven by a
-- verified Razorpay payment webhook. e.g.:
--   revoke update (premium) on public.user_state from authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- company_progress  (per-company chapter results + mock scores)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.company_progress (
  user_id     uuid not null references auth.users (id) on delete cascade,
  company_id  text not null,
  chapters    jsonb not null default '{}'::jsonb,
  mock_scores jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now(),
  primary key (user_id, company_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- daily_challenges  (today's completion flags)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.daily_challenges (
  id        uuid primary key references auth.users (id) on delete cascade,
  date      text,
  general   boolean not null default false,
  aptitude  boolean not null default false,
  coding    boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ═════════════════════════════════════════════════════════════════════════════
-- Row Level Security — owner-only access on every table.
-- ═════════════════════════════════════════════════════════════════════════════
alter table public.profiles          enable row level security;
alter table public.user_state        enable row level security;
alter table public.company_progress  enable row level security;
alter table public.daily_challenges  enable row level security;

-- profiles ----------------------------------------------------------------------
drop policy if exists "profiles owner access" on public.profiles;
create policy "profiles owner access" on public.profiles
  for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- user_state --------------------------------------------------------------------
drop policy if exists "user_state owner access" on public.user_state;
create policy "user_state owner access" on public.user_state
  for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- company_progress --------------------------------------------------------------
drop policy if exists "company_progress owner access" on public.company_progress;
create policy "company_progress owner access" on public.company_progress
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- daily_challenges --------------------------------------------------------------
drop policy if exists "daily_challenges owner access" on public.daily_challenges;
create policy "daily_challenges owner access" on public.daily_challenges
  for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
