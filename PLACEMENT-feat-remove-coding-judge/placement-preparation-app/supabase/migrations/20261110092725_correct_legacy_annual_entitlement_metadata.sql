-- Correct legacy entitlement metadata using the approved ₹249/year plan.
begin;

update public.payments p
   set entitlement_days = 365,
       premium_until = s.premium_until::timestamptz,
       entitlement_applied_at = coalesce(p.entitlement_applied_at, p.created_at)
  from public.user_state s
 where s.id = p.user_id
   and p.amount = 24900
   and p.refunded_at is null
   and p.entitlement_applied_at is null;

create or replace function public.reconcile_refunded_payment(
  p_payment_id text, p_refund_amount integer
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  target_user uuid;
  payment_amount integer;
  has_unclassified_legacy boolean;
  calculated_expiry timestamptz := now();
  creator_expiry timestamptz;
begin
  select user_id, amount into target_user, payment_amount
    from public.payments where payment_id = p_payment_id for update;
  if not found then raise exception 'payment ledger row not found'; end if;
  if p_refund_amount is null or p_refund_amount < payment_amount then return; end if;

  update public.payments set refunded_at = coalesce(refunded_at, now())
   where payment_id = p_payment_id;
  update public.affiliate_commissions set status = 'refunded'
   where payment_id = p_payment_id;
  if target_user is null then return; end if;

  perform pg_advisory_xact_lock(hashtext(target_user::text));
  select coalesce(bool_or(entitlement_days is null), false)
    into has_unclassified_legacy
    from public.payments
   where user_id = target_user and refunded_at is null
     and entitlement_applied_at is not null;
  if has_unclassified_legacy then
    return;
  end if;

  select greatest(now(), coalesce(max(created_at + make_interval(days => entitlement_days)), now()))
    into calculated_expiry
    from public.payments
   where user_id = target_user and refunded_at is null
     and entitlement_applied_at is not null and entitlement_days > 0;

  select expires_at into creator_expiry from public.creator_access
   where user_id = target_user and expires_at > now()
   order by expires_at desc limit 1;
  if creator_expiry is not null and creator_expiry > calculated_expiry then calculated_expiry := creator_expiry; end if;

  if calculated_expiry > now() then
    insert into public.user_state(id, premium, premium_until)
    values (target_user, true, calculated_expiry::text)
    on conflict (id) do update set premium = true, premium_until = excluded.premium_until;
  else
    insert into public.user_state(id, premium, premium_until)
    values (target_user, false, null)
    on conflict (id) do update set premium = false, premium_until = null;
  end if;
end;
$$;

commit;