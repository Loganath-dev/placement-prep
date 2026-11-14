-- Stage 2: apply only after the new application deployment is healthy.
-- Cut off the browser's ability to insert or update the chapters JSON snapshot.
-- The application now derives mastery from server-authored events. The client
-- retains only the harmless mock score column during this compatibility period.
revoke all on table public.company_progress from anon, authenticated;
grant select on table public.company_progress to authenticated;
grant insert (user_id, company_id, mock_scores) on table public.company_progress to authenticated;
grant update (mock_scores) on table public.company_progress to authenticated;

comment on column public.company_progress.chapters is
  'Legacy browser-writable snapshot retained for historical compatibility only. Authenticated clients have no INSERT/UPDATE privilege on this column; mastery is derived from learning_progress_events.';
