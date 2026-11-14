-- Incremental XP issuance and O(1) reward metric reads.
-- Deploy the matching application code before applying this migration.

create table if not exists public.learning_reward_metrics (
  user_id uuid primary key references auth.users(id) on delete cascade,
  lessons integer not null default 0,
  practices integer not null default 0,
  chapters integer not null default 0,
  mocks integer not null default 0,
  perfect integer not null default 0,
  xp integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint learning_reward_metrics_nonnegative check (
    lessons >= 0 and practices >= 0 and chapters >= 0 and mocks >= 0 and perfect >= 0 and xp >= 0
  )
);

-- One-time backfill preserves historical event and XP totals.
insert into public.learning_reward_metrics(user_id, lessons, practices, chapters, mocks, perfect, xp)
select e.user_id,
  count(*) filter (where e.event_type = 'lesson_practice_submitted' and e.passed)::integer,
  count(*) filter (where e.event_type in ('lesson_practice_submitted', 'chapter_assessment_submitted'))::integer,
  count(*) filter (where e.event_type = 'chapter_assessment_submitted' and e.passed)::integer,
  count(*) filter (where e.event_type = 'mock_test_submitted')::integer,
  count(*) filter (where e.event_type = 'chapter_assessment_submitted' and e.passed and e.score_percent = 100)::integer,
  coalesce((select sum(r.xp)::integer from public.learning_reward_ledger r where r.user_id = e.user_id), 0)
from public.learning_progress_events e
group by e.user_id
on conflict (user_id) do update set
  lessons = excluded.lessons, practices = excluded.practices, chapters = excluded.chapters,
  mocks = excluded.mocks, perfect = excluded.perfect, xp = excluded.xp, updated_at = now();

insert into public.learning_reward_metrics(user_id, xp)
select r.user_id, sum(r.xp)::integer from public.learning_reward_ledger r
group by r.user_id
on conflict (user_id) do update set xp = excluded.xp, updated_at = now();

create or replace function public.track_learning_reward_event()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  insert into public.learning_reward_metrics(user_id, lessons, practices, chapters, mocks, perfect)
  values (
    new.user_id,
    case when new.event_type = 'lesson_practice_submitted' and new.passed then 1 else 0 end,
    case when new.event_type in ('lesson_practice_submitted', 'chapter_assessment_submitted') then 1 else 0 end,
    case when new.event_type = 'chapter_assessment_submitted' and new.passed then 1 else 0 end,
    case when new.event_type = 'mock_test_submitted' then 1 else 0 end,
    case when new.event_type = 'chapter_assessment_submitted' and new.passed and new.score_percent = 100 then 1 else 0 end
  )
  on conflict (user_id) do update set
    lessons = public.learning_reward_metrics.lessons + excluded.lessons,
    practices = public.learning_reward_metrics.practices + excluded.practices,
    chapters = public.learning_reward_metrics.chapters + excluded.chapters,
    mocks = public.learning_reward_metrics.mocks + excluded.mocks,
    perfect = public.learning_reward_metrics.perfect + excluded.perfect,
    updated_at = now();
  return new;
end;
$$;

create or replace function public.track_learning_reward_xp()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  insert into public.learning_reward_metrics(user_id, xp)
  values (new.user_id, new.xp)
  on conflict (user_id) do update set
    xp = public.learning_reward_metrics.xp + excluded.xp,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists learning_reward_event_metrics on public.learning_progress_events;
create trigger learning_reward_event_metrics after insert on public.learning_progress_events
for each row execute function public.track_learning_reward_event();
drop trigger if exists learning_reward_xp_metrics on public.learning_reward_ledger;
create trigger learning_reward_xp_metrics after insert on public.learning_reward_ledger
for each row execute function public.track_learning_reward_xp();

alter table public.learning_reward_metrics enable row level security;
revoke all on public.learning_reward_metrics from public, anon, authenticated, service_role;

create or replace function public.get_learning_reward_metrics(p_user_id uuid)
returns jsonb language sql stable security definer set search_path = pg_catalog, public as $$
  select jsonb_build_object(
    'onboarded', coalesce((select us.onboarded from public.user_state us where us.id = p_user_id), false),
    'lessons', coalesce(m.lessons, 0),
    'practices', coalesce(m.practices, 0),
    'chapters', coalesce(m.chapters, 0),
    'mocks', coalesce(m.mocks, 0),
    'perfect', coalesce(m.perfect, 0),
    'xp', coalesce(m.xp, 0)
  )
  from (select 1) seed
  left join public.learning_reward_metrics m on m.user_id = p_user_id;
$$;

revoke all on function public.get_learning_reward_metrics(uuid) from public, anon, authenticated;
grant execute on function public.get_learning_reward_metrics(uuid) to service_role;
revoke all on function public.track_learning_reward_event() from public, anon, authenticated;
revoke all on function public.track_learning_reward_xp() from public, anon, authenticated;
comment on table public.learning_reward_metrics is 'Private incremental counters used to calculate learning badges and XP without rescanning user event history.';
