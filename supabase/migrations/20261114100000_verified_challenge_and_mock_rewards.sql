-- Server-verified daily/weekly challenge and mock-test submissions.
-- Deploy the matching application code before applying this migration.

alter table public.learning_progress_events
  drop constraint if exists learning_progress_events_event_type_check;
alter table public.learning_progress_events
  add constraint learning_progress_events_event_type_check check (event_type in (
    'lesson_card_completed', 'lesson_practice_submitted',
    'chapter_recall_completed', 'chapter_assessment_submitted',
    'daily_challenge_submitted', 'weekly_challenge_submitted', 'mock_test_submitted'
  ));

-- One rewardable completion per user and local calendar period.
create unique index if not exists learning_daily_challenge_once_idx
  on public.learning_progress_events(user_id, chapter_id)
  where event_type = 'daily_challenge_submitted';
create unique index if not exists learning_weekly_challenge_once_idx
  on public.learning_progress_events(user_id, chapter_id)
  where event_type = 'weekly_challenge_submitted';

-- A user can submit many mock attempts, but the first-mock XP key is globally
-- unique per user/company even under concurrent submissions.
create unique index if not exists learning_reward_one_first_mock_per_company_idx
  on public.learning_reward_ledger(user_id, reward_key)
  where reward_key like 'mock-first-%';

comment on index public.learning_daily_challenge_once_idx is 'Prevents repeat XP for the same user and daily challenge period.';
comment on index public.learning_weekly_challenge_once_idx is 'Prevents repeat XP for the same user and weekly challenge period.';
