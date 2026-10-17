-- StudyBench — scalable schema additions.
--
-- What this migration adds:
--   1. `mistakes`         — per-user wrong-answer notebook (was localStorage-only: data lost on device switch).
--   2. `question_reports` — student-flagged content issues (referenced in db.ts since v1, never created).
--   3. `coding_attempts`  — per-problem attempt log (was a JSONB blob inside user_state, unqueryable).
--   4. Strategic indexes  — cover the two hot-path queries: progress by user, mistakes by user+topic.
--   5. updated_at triggers — keep timestamps accurate on every row mutation.
--   6. premium_until column on user_state (was missing; added in this release cycle).

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. mistakes
--    One row per (user × question). ON CONFLICT updates the existing entry so
--    the store always reflects the most recent wrong attempt without unbounded growth.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.mistakes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid    not null references auth.users (id) on delete cascade,
  question_id text    not null,
  prompt      text    not null,
  options     jsonb   not null default '[]'::jsonb,
  answer      integer not null,
  chosen      integer not null,
  explanation text    not null default '',
  topic       text    not null default '',
  difficulty  text    not null default 'medium',
  ts          bigint  not null default 0,  -- epoch ms when the wrong answer was recorded
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint mistakes_user_question unique (user_id, question_id)
);

alter table public.mistakes enable row level security;

create policy "mistakes owner access" on public.mistakes
  for all to authenticated
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Fast lookup: all mistakes for a user, sorted by recency.
create index if not exists idx_mistakes_user_ts
  on public.mistakes (user_id, ts desc);

-- Fast topic-filtered mistake lookup (for repair mode drill).
create index if not exists idx_mistakes_user_topic
  on public.mistakes (user_id, topic);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. question_reports
--    Collects student flags. Reviewed by the content team offline.
--    Only the user who filed it can read it (no leaking other reports).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.question_reports (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete set null,
  question_id text not null,
  prompt      text not null default '',
  reason      text,
  created_at  timestamptz not null default now()
);

alter table public.question_reports enable row level security;

-- Users can insert their own reports; only service-role can read them all.
create policy "question_reports insert own" on public.question_reports
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "question_reports select own" on public.question_reports
  for select to authenticated
  using (auth.uid() = user_id);

-- Content-team admin queries: reports by question_id (find most-reported questions).
create index if not exists idx_question_reports_question_id
  on public.question_reports (question_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. coding_attempts
--    Extracted from the JSONB blob in user_state.
--    One row per (user × problem); ON CONFLICT keeps only the latest attempt.
--    Enables future leaderboards, analytics (hardest problems), and portability export.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.coding_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid    not null references auth.users (id) on delete cascade,
  problem_id   text    not null,
  title        text    not null default '',
  company_id   text    not null default 'general',
  passed       integer not null default 0,
  total        integer not null default 0,
  ts           bigint  not null default 0,  -- epoch ms, preserved from client
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint coding_attempts_user_problem unique (user_id, problem_id)
);

alter table public.coding_attempts enable row level security;

create policy "coding_attempts owner access" on public.coding_attempts
  for all to authenticated
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_coding_attempts_user_ts
  on public.coding_attempts (user_id, ts desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. premium_until column (in case 0003 has not been applied)
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.user_state
  add column if not exists premium_until timestamptz;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Strategic indexes on existing hot-path queries
-- ─────────────────────────────────────────────────────────────────────────────

-- company_progress: most queries filter by user_id only (load all company progress for one user).
create index if not exists idx_company_progress_user_id
  on public.company_progress (user_id);

-- user_state: primary key is already indexed; add composite for premium analytics.
create index if not exists idx_user_state_premium
  on public.user_state (premium, premium_until)
  where premium = true;  -- partial index — only index paying users

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. updated_at auto-update trigger (shared function)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
  returns trigger
  language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply to every table that has updated_at.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'user_state', 'company_progress', 'daily_challenges',
    'mistakes', 'coding_attempts'
  ]
  loop
    execute format(
      'create trigger trg_%s_updated_at
         before update on public.%s
         for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end;
$$;
