-- Store one weekly personalized challenge completion alongside daily flags.
alter table public.daily_challenges
  add column if not exists weekly_date text,
  add column if not exists weekly_completed boolean not null default false,
  add column if not exists weekly_score integer;

alter table public.daily_challenges
  add constraint daily_challenges_weekly_score_range
  check (weekly_score is null or weekly_score between 0 and 100);
