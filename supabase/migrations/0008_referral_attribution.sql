-- Referral attribution: who invited whom.
--
-- The /invite marketing page already accepts ?ref=<uid> and forwards it to
-- signup, but nothing ever stored it. This adds the column and locks it down
-- the same way 0006 locked down premium/premium_until: client can set it
-- exactly once (their first profile upsert after signup), never change it
-- afterwards, and never refer themselves.

alter table public.profiles
  add column if not exists referred_by uuid references auth.users (id) on delete set null;

create index if not exists idx_profiles_referred_by
  on public.profiles (referred_by);

create or replace function public.protect_referred_by()
  returns trigger
  language plpgsql
  set search_path = pg_catalog
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;  -- service role / migrations / SQL editor
  end if;

  -- Never allow self-referral.
  if new.referred_by is not null and new.referred_by = new.id then
    new.referred_by := null;
  end if;

  -- INSERT: any value is fine (subject to the self-referral check above).
  if tg_op = 'INSERT' then
    return new;
  end if;

  -- UPDATE: once set, referred_by is immutable from the client.
  if old.referred_by is not null and new.referred_by is distinct from old.referred_by then
    new.referred_by := old.referred_by;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_profiles_protect_referred_by on public.profiles;
create trigger trg_profiles_protect_referred_by
  before insert or update on public.profiles
  for each row execute function public.protect_referred_by();
