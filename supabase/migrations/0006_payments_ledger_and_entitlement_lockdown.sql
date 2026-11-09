-- StudyBench — payments ledger + entitlement column lockdown.
--
-- Fixes three revenue-critical holes:
--   1. No payment audit trail: /api/razorpay/verify granted premium without
--      recording the payment, so a (order_id, payment_id, signature) trio could
--      be replayed by any signed-in user. The `payments` table's primary key on
--      payment_id makes every Razorpay payment consumable exactly once.
--   2. `premium_until` was client-writable: migration 0004 only constrained the
--      `premium` boolean, so a paying user could extend premium_until forever
--      via PostgREST.
--   3. Delete-and-reinsert bypass: 0004's owner DELETE policy plus its
--      unconstrained INSERT policy let a user drop their user_state row and
--      re-insert it with premium = true.
-- The trigger below closes 2 and 3 for INSERT and UPDATE in one place,
-- regardless of which policy path a write takes.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. payments — append-only ledger, written only by the service role.
--    Survives account deletion (user_id nulls out) so financial records remain
--    for reconciliation, refunds and GST/audit requirements.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  payment_id text primary key,  -- Razorpay payment id; PK = one grant per payment, ever
  order_id   text not null,
  user_id    uuid references auth.users (id) on delete set null,
  amount     integer not null,  -- paise, as reported by Razorpay
  currency   text not null default 'INR',
  source     text not null check (source in ('verify', 'webhook')),
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

-- Owners may read their own payment history. There are intentionally no
-- INSERT/UPDATE/DELETE policies: only the service role (which bypasses RLS)
-- writes this table.
drop policy if exists "payments owner select" on public.payments;
create policy "payments owner select" on public.payments
  for select to authenticated
  using (auth.uid() = user_id);

create index if not exists idx_payments_user_id
  on public.payments (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Entitlement column lockdown.
--    PostgREST clients run as `authenticated`/`anon`; the verify route and
--    webhook use the service role. Block any client write that sets or changes
--    premium / premium_until — covering INSERT (delete-and-reinsert bypass)
--    and UPDATE (self-grant, self-extend, and accidental self-downgrade,
--    which previously let a paying user destroy their own entitlement).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.protect_entitlement_columns()
  returns trigger
  language plpgsql
  set search_path = pg_catalog
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;  -- service role / migrations / SQL editor
  end if;

  if tg_op = 'INSERT' then
    if new.premium or new.premium_until is not null then
      raise exception 'premium entitlement is managed server-side';
    end if;
  elsif new.premium is distinct from old.premium
     or new.premium_until is distinct from old.premium_until then
    raise exception 'premium entitlement is managed server-side';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_user_state_protect_entitlement on public.user_state;
create trigger trg_user_state_protect_entitlement
  before insert or update on public.user_state
  for each row execute function public.protect_entitlement_columns();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Simplify the user_state UPDATE policy.
--    0004's WITH CHECK subquery (premium must equal its current value) is now
--    redundant — the trigger is the single enforcement point — and it allowed
--    premium -> false self-downgrades, which the trigger no longer does.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "user_state owner update" on public.user_state;
create policy "user_state owner update" on public.user_state
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
