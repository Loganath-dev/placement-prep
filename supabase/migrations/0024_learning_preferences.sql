-- StudyBench: persist student learning preferences from onboarding.
alter table public.user_state
  add column if not exists learning_preferences jsonb not null default '{}'::jsonb;
