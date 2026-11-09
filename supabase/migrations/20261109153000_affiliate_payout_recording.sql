-- Record a manually executed UPI payout atomically against approved commissions.
begin;

create unique index if not exists uq_affiliate_payouts_transaction_id
  on public.affiliate_payouts(transaction_id)
  where transaction_id is not null;

create or replace function public.record_affiliate_payout(
  p_user_id uuid,
  p_paid_by uuid,
  p_transaction_id text
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_upi text;
  v_minimum integer;
  v_amount integer;
  v_payout_id uuid;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if p_user_id is null or p_paid_by is null then
    raise exception 'payout user and admin are required';
  end if;
  if p_transaction_id is null or length(trim(p_transaction_id)) < 3 or length(trim(p_transaction_id)) > 120 then
    raise exception 'valid UPI transaction reference is required';
  end if;

  select upi_id into v_upi
  from public.profiles
  where id = p_user_id
  for update;
  if v_upi is null or length(trim(v_upi)) = 0 then
    raise exception 'referrer has not saved a UPI ID';
  end if;

  select minimum_payout_paise into v_minimum
  from public.affiliate_settings
  where id = 1 and is_enabled = true;
  if v_minimum is null then
    raise exception 'affiliate programme is disabled or not configured';
  end if;

  perform id
  from public.affiliate_commissions
  where referrer_id = p_user_id and status = 'approved'
  for update;

  select coalesce(sum(commission_amount), 0)::integer into v_amount
  from public.affiliate_commissions
  where referrer_id = p_user_id and status = 'approved';

  if v_amount < v_minimum then
    raise exception 'approved balance is below the minimum payout';
  end if;

  insert into public.affiliate_payouts(user_id, amount, upi_id, transaction_id, payment_method, paid_by, paid_at, status)
  values (p_user_id, v_amount, v_upi, trim(p_transaction_id), 'UPI', p_paid_by, now(), 'paid')
  returning id into v_payout_id;

  update public.affiliate_commissions
  set status = 'paid', paid_date = now(), updated_at = now()
  where referrer_id = p_user_id and status = 'approved';

  return v_payout_id;
end;
$$;

revoke all on function public.record_affiliate_payout(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.record_affiliate_payout(uuid, uuid, text) to service_role;

commit;
