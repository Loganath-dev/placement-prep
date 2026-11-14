-- Reconcile company_progress permissions with the server-authoritative
-- learning-progress model.
--
-- This is a new, idempotent reconciliation migration for the verified live
-- permission state. It does not claim to be the unrecovered original
-- 20261114035209 migration source.
--
-- Authenticated clients may read company progress and continue writing only
-- the compatibility mock_scores column. They cannot insert or update the
-- legacy chapters mastery snapshot. Anonymous clients receive no table access.

begin;

revoke all privileges on table public.company_progress from anon, authenticated;

grant select on table public.company_progress to authenticated;
grant insert (user_id, company_id, mock_scores)
  on table public.company_progress to authenticated;
grant update (mock_scores)
  on table public.company_progress to authenticated;

comment on column public.company_progress.chapters is
  'Legacy browser-writable snapshot retained for historical compatibility only. Authenticated clients have no INSERT/UPDATE privilege on this column; mastery is derived from learning_progress_events.';

commit;
