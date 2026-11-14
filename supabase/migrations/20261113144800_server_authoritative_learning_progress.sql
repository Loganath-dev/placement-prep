-- Stage 1 of the learning-progress security cutover.
-- This migration is additive and intentionally does NOT revoke legacy writes yet.
-- Apply only after the application cutover has been deployed and verified.

create table if not exists public.company_progress_legacy_archive (
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id text not null,
  chapters jsonb not null default '{}'::jsonb,
  mock_scores jsonb not null default '[]'::jsonb,
  archived_at timestamptz not null default now(),
  provenance text not null default 'browser_writable_snapshot_unverified',
  primary key (user_id, company_id)
);

-- Preserve every existing snapshot verbatim. ON CONFLICT makes this safe to rerun.
insert into public.company_progress_legacy_archive (user_id, company_id, chapters, mock_scores)
select user_id, company_id::text, coalesce(chapters, '{}'::jsonb), coalesce(to_jsonb(mock_scores), '[]'::jsonb)
from public.company_progress
on conflict (user_id, company_id) do nothing;

create table if not exists public.learning_progress_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id text not null,
  section_id text not null,
  chapter_id text not null,
  lesson_id text,
  event_type text not null check (event_type in (
    'lesson_card_completed', 'lesson_practice_submitted',
    'chapter_recall_completed', 'chapter_assessment_submitted'
  )),
  -- Server-generated event payload only. Never accept score/pass/xp from browser.
  question_ids text[] not null default '{}',
  selected_answers jsonb not null default '{}'::jsonb,
  score_percent smallint check (score_percent between 0 and 100),
  passed boolean,
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create index if not exists learning_progress_events_user_path_idx
  on public.learning_progress_events (user_id, company_id, section_id, chapter_id, created_at desc);

alter table public.company_progress_legacy_archive enable row level security;
alter table public.learning_progress_events enable row level security;

-- Students can inspect only their own archived history and verified events.
drop policy if exists "legacy archive owner read" on public.company_progress_legacy_archive;
create policy "legacy archive owner read" on public.company_progress_legacy_archive
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "learning events owner read" on public.learning_progress_events;
create policy "learning events owner read" on public.learning_progress_events
  for select to authenticated using ((select auth.uid()) = user_id);

-- No INSERT/UPDATE/DELETE policy for authenticated: writes must come from a
-- trusted server endpoint using the service role after canonical validation.
revoke all on public.company_progress_legacy_archive from anon, authenticated;
grant select on public.company_progress_legacy_archive to authenticated;
revoke all on public.learning_progress_events from anon, authenticated;
grant select on public.learning_progress_events to authenticated;
grant all on public.company_progress_legacy_archive to service_role;
grant all on public.learning_progress_events to service_role;

comment on table public.company_progress_legacy_archive is
  'Immutable compatibility archive. All imported progress is historical/unverified and MUST NOT grant unlocks, XP, badges, or entitlement.';
comment on table public.learning_progress_events is
  'Server-authored learning events. Browser roles are read-only; server validates canonical question/card IDs before inserting.';


-- Prevent duplicate card and recall achievements even if a client rotates idempotency keys.
create unique index if not exists learning_progress_one_card_event_idx
  on public.learning_progress_events (user_id, company_id, chapter_id, (selected_answers ->> 'cardId'))
  where event_type = 'lesson_card_completed';

create unique index if not exists learning_progress_one_recall_event_idx
  on public.learning_progress_events (user_id, company_id, chapter_id)
  where event_type = 'chapter_recall_completed';
