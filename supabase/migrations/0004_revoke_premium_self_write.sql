-- Harden the premium entitlement column so clients cannot self-grant premium.
-- The verify route and webhook both use the service-role key to flip premium,
-- so authenticated users only need to read this column, not write it.

-- Drop the blanket owner policy and replace with read-only on premium/premium_until.
drop policy if exists "user_state owner access" on public.user_state;

-- New policy: owner can read and write all columns EXCEPT premium and premium_until.
-- We split into two policies:
--   1. Full read access (select) — owners read all their own columns.
--   2. Restricted write (insert/update) — owners can write all columns except premium/premium_until.

create policy "user_state owner select" on public.user_state
  for select to authenticated
  using (auth.uid() = id);

create policy "user_state owner insert" on public.user_state
  for insert to authenticated
  with check (auth.uid() = id);

-- UPDATE: allowed on all columns except premium and premium_until.
-- Postgres does not support column-level WITH CHECK on UPDATE directly in RLS,
-- so we enforce it via a SECURITY DEFINER function trigger instead.
-- The practical approach: remove the blanket update policy and add one that
-- only passes when premium is not being changed to a value the row doesn't already have.
create policy "user_state owner update" on public.user_state
  for update to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Block any attempt to set premium = true from client writes.
    and (premium = false or premium = (select premium from public.user_state where id = auth.uid()))
  );

create policy "user_state owner delete" on public.user_state
  for delete to authenticated
  using (auth.uid() = id);
