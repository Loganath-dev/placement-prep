-- StudyBench — analytics events table.
--
-- Lightweight event log for understanding the user funnel:
--   signups, onboarding completions, quiz attempts, mock completions,
--   premium upgrades, chapter starts, and SEO page views.
--
-- RLS: users can only insert their own events (user_id matches auth.uid()).
-- Service-role reads all rows for the admin metrics page.
-- Anonymous (public) events use user_id = null.
--
-- Apply with: supabase db push  (or paste into the Supabase SQL editor)

create table if not exists public.analytics_events (
  id          bigserial primary key,
  user_id     uuid references auth.users (id) on delete set null,
  event       text        not null,
  properties  jsonb       not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

-- Index for funnel queries: filter by event type, then sort by time.
create index if not exists idx_analytics_events_event_time
  on public.analytics_events (event, occurred_at desc);

-- Index for per-user event history.
create index if not exists idx_analytics_events_user_id
  on public.analytics_events (user_id, occurred_at desc);

-- RLS --
alter table public.analytics_events enable row level security;

-- Authenticated users can insert their own events.
create policy "users can insert own events" on public.analytics_events
  for insert to authenticated
  with check (user_id = auth.uid() or user_id is null);

-- No user SELECT — event data is admin-only.
-- (The admin page uses the service-role key, not the anon key.)
