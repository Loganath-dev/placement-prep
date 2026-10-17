-- Migration 0019: Fix profiles payout columns + updated_at auto-refresh
--
-- Fixes:
--  1. Ensures upi_id, upi_name, phone_number, referred_by columns all exist
--     (idempotent — safe to run even if a previous migration already added them).
--  2. Adds an updated_at auto-refresh trigger on profiles so any UPDATE
--     automatically bumps the timestamp without the app needing to set it.
--  3. Re-asserts the profiles owner access RLS policy (covers payout field writes).

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Ensure all payout + attribution columns exist (idempotent).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists referred_by   uuid references auth.users (id) on delete set null,
  add column if not exists upi_id        text,
  add column if not exists upi_name      text,
  add column if not exists phone_number  text,
  add column if not exists signup_ip     text;

-- Ensure the index for referred_by lookups exists.
create index if not exists idx_profiles_referred_by
  on public.profiles (referred_by);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Auto-refresh updated_at on every profiles UPDATE.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.set_profiles_updated_at()
  returns trigger
  language plpgsql
  set search_path = pg_catalog
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_profiles_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Ensure the "profiles owner access" ALL policy exists and covers UPDATE.
--    Drop + recreate is safe — the definition is identical to 0001_init.sql.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "profiles owner access" on public.profiles;
create policy "profiles owner access" on public.profiles
  for all to authenticated
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Ensure the protect_referred_by trigger still exists (idempotent).
-- ─────────────────────────────────────────────────────────────────────────────
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
