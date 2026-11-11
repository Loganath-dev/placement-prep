-- StudyBench no longer runs refund reconciliation. Keep the financial ledger
-- for auditability, but remove application refund state and make paid renewals
-- extend from the later of now or the user's existing Premium expiry.
begin;

drop function if exists public.reconcile_refunded_payment(text, integer);
alter table public.payments drop column if exists refunded_at;

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
    insert into public.user_state(id, premium, premium_until)
    values (p_user_id, true, null)
    on conflict (id) do update set premium = true, premium_until = null;
    target_expiry := null;
  else
    if p_days <= 0 then raise exception 'premium duration must be positive'; end if;

    -- Serialize renewals for the same user. Early renewals stack; expired
    -- accounts start a fresh period from the current time.
    perform pg_advisory_xact_lock(hashtext(p_user_id::text));
    select premium_until into current_expiry
      from public.user_state where id = p_user_id for update;
    target_expiry := greatest(coalesce(current_expiry, now()), now())
      + make_interval(days => p_days);

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

revoke all on function public.grant_premium_for_payment(text, uuid, integer) from public, anon, authenticated;
grant execute on function public.grant_premium_for_payment(text, uuid, integer) to service_role;

commit;
