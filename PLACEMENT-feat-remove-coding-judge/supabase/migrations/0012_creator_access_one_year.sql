-- Upgrade creator grants from lifetime access to one year from redemption.
-- Idempotent so it is safe whether 0011 was applied before or after this rule.

alter table public.creator_access
  add column if not exists expires_at timestamptz;

update public.creator_access
set expires_at = granted_at + interval '1 year'
where expires_at is null;

alter table public.creator_access alter column expires_at set not null;

create or replace function public.redeem_creator_code(p_user_id uuid, p_code_hash text)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  claimed_hash text;
begin
  if exists (select 1 from public.creator_access where user_id = p_user_id) then
    return true;
  end if;

  update public.creator_invite_codes
  set redeemed_by = p_user_id, redeemed_at = now()
  where code_hash = p_code_hash and redeemed_by is null
  returning code_hash into claimed_hash;

  if claimed_hash is null then return false; end if;

  insert into public.creator_access(user_id, invite_hash, granted_at, expires_at)
  values (p_user_id, claimed_hash, now(), now() + interval '1 year');
  return true;
end;
$$;

revoke all on function public.redeem_creator_code(uuid, text) from public, anon, authenticated;
grant execute on function public.redeem_creator_code(uuid, text) to service_role;
