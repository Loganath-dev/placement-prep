-- Server-owned XP and badge awards plus a student-visible legacy history view.
-- Apply after 20261113144800_server_authoritative_learning_progress.sql.

create table if not exists public.learning_reward_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_event_id uuid not null references public.learning_progress_events(id) on delete cascade,
  reward_key text not null,
  xp integer not null check (xp > 0),
  created_at timestamptz not null default now(),
  unique (source_event_id, reward_key)
);
create index if not exists learning_reward_ledger_user_idx
  on public.learning_reward_ledger(user_id, created_at desc);

create table if not exists public.learning_badge_awards (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz not null default now(),
  evidence jsonb not null default '{}'::jsonb,
  primary key (user_id, badge_id)
);

alter table public.learning_reward_ledger enable row level security;
alter table public.learning_badge_awards enable row level security;
drop policy if exists "learning rewards owner read" on public.learning_reward_ledger;
create policy "learning rewards owner read" on public.learning_reward_ledger
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "learning badge awards owner read" on public.learning_badge_awards;
create policy "learning badge awards owner read" on public.learning_badge_awards
  for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.learning_reward_ledger from anon, authenticated;
revoke all on public.learning_badge_awards from anon, authenticated;
grant select on public.learning_reward_ledger to authenticated;
grant select on public.learning_badge_awards to authenticated;
grant all on public.learning_reward_ledger to service_role;
grant all on public.learning_badge_awards to service_role;

-- Authenticated browser clients cannot mint or overwrite XP/badge state.
-- Server-side service-role requests have auth.uid() = NULL and remain permitted.
create or replace function public.reject_client_gamification_write()
returns trigger language plpgsql security invoker set search_path = pg_catalog, public
as $$
begin
  if auth.uid() is not null then
    if tg_op = 'INSERT' and (coalesce(new.xp, 0) <> 0 or coalesce(new.badges, '[]'::jsonb) <> '[]'::jsonb) then
      raise exception 'XP and badges are server-managed' using errcode = '42501';
    elsif tg_op = 'UPDATE' and (new.xp is distinct from old.xp or new.badges is distinct from old.badges) then
      raise exception 'XP and badges are server-managed' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists protect_user_state_gamification on public.user_state;
create trigger protect_user_state_gamification
before insert or update of xp, badges on public.user_state
for each row execute function public.reject_client_gamification_write();

comment on table public.learning_reward_ledger is 'Immutable server-issued XP ledger. One reward per verified learning event and reward key.';
comment on table public.learning_badge_awards is 'Immutable server-issued badge awards based only on verified learning events and XP ledger.';


create table if not exists public.user_gamification_legacy_archive (
  user_id uuid primary key references auth.users(id) on delete cascade,
  legacy_xp integer not null default 0,
  legacy_badges jsonb not null default '[]'::jsonb,
  archived_at timestamptz not null default now(),
  provenance text not null default 'client_writable_gamification_snapshot_unverified'
);
alter table public.user_gamification_legacy_archive enable row level security;
drop policy if exists "legacy gamification owner read" on public.user_gamification_legacy_archive;
create policy "legacy gamification owner read" on public.user_gamification_legacy_archive
  for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.user_gamification_legacy_archive from anon, authenticated;
grant select on public.user_gamification_legacy_archive to authenticated;
grant all on public.user_gamification_legacy_archive to service_role;
insert into public.user_gamification_legacy_archive(user_id, legacy_xp, legacy_badges)
select id, coalesce(xp, 0), coalesce(badges, '[]'::jsonb) from public.user_state
on conflict (user_id) do nothing;
comment on table public.user_gamification_legacy_archive is 'Historical client-writable XP/badges snapshot. Preserved for display only; never contributes to current XP or badge awards.';
