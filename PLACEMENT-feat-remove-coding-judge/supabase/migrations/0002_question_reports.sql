-- StudyBench — question report queue.
--
-- Backs lib/supabase/db.ts `reportQuestion()`. When a student flags a question as
-- wrong/unclear/typo/source-issue, a row lands here for the content team to review
-- (the team reads with the service-role key, which bypasses RLS).
--
-- RLS: a signed-in user may only file reports as themselves and read back their
-- own — they can never see or edit anyone else's. Rows are immutable from the
-- client (no update/delete policy); the review team manages status server-side.
--
-- Apply with:  supabase db push   (or paste into the Supabase SQL editor)

create table if not exists public.question_reports (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  prompt      text,
  reason      text,                          -- wrong-answer | unclear | typo | source | (free note)
  status      text not null default 'open',  -- open | reviewed | dismissed (team-managed)
  created_at  timestamptz not null default now()
);

create index if not exists question_reports_status_idx
  on public.question_reports (status, created_at desc);

alter table public.question_reports enable row level security;

-- A user can file a report only as themselves.
drop policy if exists "question_reports insert own" on public.question_reports;
create policy "question_reports insert own" on public.question_reports
  for insert to authenticated
  with check (auth.uid() = user_id);

-- A user can read back only their own reports.
drop policy if exists "question_reports select own" on public.question_reports;
create policy "question_reports select own" on public.question_reports
  for select to authenticated
  using (auth.uid() = user_id);
