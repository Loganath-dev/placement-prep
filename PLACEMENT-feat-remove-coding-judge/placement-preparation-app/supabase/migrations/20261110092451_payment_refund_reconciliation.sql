-- 0026: reconcile Razorpay refunds with affiliate commissions and Premium access.
begin;

alter table public.payments
  add column if not exists entitlement_days integer,
  add column if not exists refunded_at timestamptz;

create or replace function public.grant_premium_for_payment(
  p_payment_id text,
  p_user_id uuid,
  p_days integer
)
returns timestamptz
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  payment_row public.payments%rowtype;
  current_expiry timestamptz;
  target_expiry timestamptz;
begin
  select * into payment_row
    from public.payments
   where payment_id = p_payment_id
   for update;

  if not found then raise exception 'payment ledger row not found'; end if;
  if payment_row.user_id is distinct from p_user_id then raise exception 'payment user mismatch'; end if;
  if payment_row.refunded_at is not null then raise exception 'refunded payment cannot grant Premium'; end if;

  if payment_row.entitlement_applied_at is not null then
    return payment_row.premium_until;
  end if;

  if p_days is null then
    insert into public.user_state(id, premium, premium_until)
    values (p_user_id, true, null)
    on conflict (id) do update
      set premium = true, premium_until = null;
    target_expiry := null;
  else
    if p_days <= 0 then raise exception 'premium duration must be positive'; end if;
    select premium_until into current_expiry
      from public.user_state where id = p_user_id for update;
    target_expiry := now() + make_interval(days => p_days);
    if current_expiry is not null and current_expiry > target_expiry then
      target_expiry := current_expiry;
    end if;
    insert into public.user_state(id, premium, premium_until)
    values (p_user_id, true, target_expiry)
    on conflict (id) do update
      set premium = true, premium_until = excluded.premium_until;
  end if;

  update public.payments
     set premium_until = target_expiry,
         entitlement_days = p_days,
         entitlement_applied_at = now()
   where payment_id = p_payment_id;

  return target_expiry;
end;
$$;

create or replace function public.reconcile_refunded_payment(
  p_payment_id text,
  p_refund_amount integer
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  target_user uuid;
  payment_amount integer;
  has_legacy_lifetime boolean;
  calculated_expiry timestamptz := now();
  payment_row record;
  creator_expiry timestamptz;
begin
  select user_id, amount into target_user, payment_amount
    from public.payments
   where payment_id = p_payment_id
   for update;

  if not found then
    raise exception 'payment ledger row not found';
  end if;

  if p_refund_amount is null or p_refund_amount < payment_amount then
    -- A partial refund does not revoke the purchased Premium period or referral reward.
    return;
  end if;

  update public.payments
     set refunded_at = coalesce(refunded_at, now())
   where payment_id = p_payment_id;

  update public.affiliate_commissions
     set status = 'refunded'
   where payment_id = p_payment_id;

  if target_user is null then
    return;
  end if;

  -- Serialize entitlement recomputation when multiple payments for one user
  -- are refunded at nearly the same time.
  perform pg_advisory_xact_lock(hashtext(target_user::text));

  -- Older payments pre-date entitlement_days. Preserve their entitlement
  -- rather than accidentally revoking a legacy/lifetime purchase.
  select coalesce(bool_or(entitlement_days is null), false)
    into has_legacy_lifetime
    from public.payments
   where user_id = target_user
     and refunded_at is null
     and entitlement_applied_at is not null;

  if has_legacy_lifetime then
    insert into public.user_state(id, premium, premium_until)
    values (target_user, true, null)
    on conflict (id) do update
      set premium = true, premium_until = null;
    return;
  end if;

  for payment_row in
    select entitlement_days, created_at
      from public.payments
     where user_id = target_user
       and refunded_at is null
       and entitlement_applied_at is not null
       and entitlement_days > 0
     order by created_at asc, payment_id asc
  loop
    calculated_expiry := greatest(calculated_expiry, payment_row.created_at)
      + make_interval(days => payment_row.entitlement_days);
  end loop;

  select expires_at into creator_expiry
    from public.creator_access
   where user_id = target_user
     and expires_at > now()
   order by expires_at desc
   limit 1;

  if creator_expiry is not null and creator_expiry > calculated_expiry then
    calculated_expiry := creator_expiry;
  end if;

  if calculated_expiry > now() then
    insert into public.user_state(id, premium, premium_until)
    values (target_user, true, calculated_expiry)
    on conflict (id) do update
      set premium = true, premium_until = excluded.premium_until;
  else
    insert into public.user_state(id, premium, premium_until)
    values (target_user, false, null)
    on conflict (id) do update
      set premium = false, premium_until = null;
  end if;
end;
$$;

revoke all on function public.reconcile_refunded_payment(text, integer) from public, anon, authenticated;
grant execute on function public.reconcile_refunded_payment(text, integer) to service_role;

commit;