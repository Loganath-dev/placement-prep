-- 0022: Make paid entitlements idempotent across checkout verification and webhooks.
begin;

alter table public.payments
  add column if not exists entitlement_applied_at timestamptz,
  add column if not exists premium_until timestamptz;

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
  if payment_row.entitlement_applied_at is not null then
    return payment_row.premium_until;
  end if;

  if p_days is null then
    -- Null duration is reserved for already-created legacy lifetime orders.
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
         entitlement_applied_at = now()
   where payment_id = p_payment_id;

  return target_expiry;
end;
$$;

revoke all on function public.grant_premium_for_payment(text,uuid,integer) from public, anon, authenticated;
grant execute on function public.grant_premium_for_payment(text,uuid,integer) to service_role;

commit;
