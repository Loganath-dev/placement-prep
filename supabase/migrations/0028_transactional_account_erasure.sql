-- 0028: delete a user's learning/profile data atomically before deleting auth identity.
begin;

create or replace function public.erase_user_data(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_user_id is null then
    raise exception 'user id is required';
  end if;

  delete from public.company_progress where user_id = p_user_id;
  delete from public.daily_challenges where id = p_user_id;
  delete from public.mistakes where user_id = p_user_id;
  delete from public.drive_outcomes where user_id = p_user_id;
  delete from public.coding_attempts where user_id = p_user_id;
  delete from public.user_state where id = p_user_id;
  delete from public.profiles where id = p_user_id;

  -- Financial ledger rows are intentionally retained for statutory accounting;
  -- their FK uses ON DELETE SET NULL. Question reports are deleted by their
  -- ON DELETE CASCADE relationship when the Auth identity is deleted.
end;
$$;

revoke all on function public.erase_user_data(uuid) from public, anon, authenticated;
grant execute on function public.erase_user_data(uuid) to service_role;

commit;
