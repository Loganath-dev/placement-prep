-- Prevent onboarding completion from being reset client-side.
-- Once a user finishes onboarding, onboarded=true is permanent unless an
-- admin uses the service role to change it.

create or replace function public.protect_onboarded_flag()
  returns trigger
  language plpgsql
  set search_path = pg_catalog
as $$
begin
  if tg_op = 'UPDATE' and old.onboarded = true and new.onboarded = false then
    new.onboarded := true;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_user_state_protect_onboarded on public.user_state;
create trigger trg_user_state_protect_onboarded
  before update on public.user_state
  for each row execute function public.protect_onboarded_flag();

-- Backfill users who clearly finished onboarding but lost the flag.
update public.user_state us
set onboarded = true
from public.profiles p
where p.id = us.id
  and us.onboarded = false
  and coalesce(nullif(trim(p.name), ''), '') <> ''
  and coalesce(jsonb_array_length(us.interested), 0) > 0;
