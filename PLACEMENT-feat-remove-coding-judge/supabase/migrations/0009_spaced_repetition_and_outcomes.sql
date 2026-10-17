-- StudyBench — spaced-repetition schedule + real drive outcomes.
--
-- What this migration adds:
--   1. Leitner schedule columns on `mistakes` (box / due / reviews / lapses).
--      These were localStorage-only, so a student's review schedule was lost on
--      a device switch. Persisting them makes spaced repetition portable.
--   2. `drive_outcomes` — self-reported real placement-drive results paired with
--      the in-app PRI at the time. Also localStorage-only before this; syncing
--      it makes the honest "did my Readiness track reality?" history portable.
--
-- Apply with:  supabase db push   (or paste into the Supabase SQL editor)

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Spaced-repetition columns on mistakes
--    Defaults match lib/spaced-repetition.ts: a fresh miss is box 1, due now.
--    Existing rows get box 1 / reviews 0 / lapses 0 and a NULL due (treated as
--    "due now" by the client), so historical mistakes surface for review.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.mistakes
  add column if not exists box     smallint not null default 1,
  add column if not exists due     bigint,
  add column if not exists reviews integer  not null default 0,
  add column if not exists lapses  integer  not null default 0;

-- Hot path: "which cards are due for this user", weakest box first.
create index if not exists idx_mistakes_user_due
  on public.mistakes (user_id, due);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. drive_outcomes
--    One row per logged outcome. The client supplies `id` (a UUID), so the PK is
--    composite (user_id, id) and upserts use on_conflict = "user_id,id".
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.drive_outcomes (
  id            text    not null,
  user_id       uuid    not null references auth.users (id) on delete cascade,
  company_id    text    not null,
  result        text    not null,            -- selected | rejected | in-progress | withdrawn
  stage_reached text    not null,            -- online-test | group-discussion | technical | hr | offer
  pri_at_drive  integer not null default 0,  -- 0-100 PRI snapshot when logged
  ts            bigint  not null default 0,  -- drive date, epoch ms
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.drive_outcomes enable row level security;

drop policy if exists "drive_outcomes owner access" on public.drive_outcomes;
create policy "drive_outcomes owner access" on public.drive_outcomes
  for all to authenticated
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- All outcomes for a user, most recent first.
create index if not exists idx_drive_outcomes_user_ts
  on public.drive_outcomes (user_id, ts desc);

-- Keep updated_at fresh (reuses the shared trigger function from 0005).
drop trigger if exists trg_drive_outcomes_updated_at on public.drive_outcomes;
create trigger trg_drive_outcomes_updated_at
  before update on public.drive_outcomes
  for each row execute function public.set_updated_at();
