-- Preserve the exact UPI destination used for each affiliate payout.
-- Historical rows remain nullable; new settlements snapshot both fields.
begin;

alter table public.affiliate_payouts
  add column if not exists upi_name text;

comment on column public.affiliate_payouts.upi_name is
  'Account-holder name snapshot captured at payout time; nullable for historical records.';

create or replace function public.admin_pay_affiliate_commission(
  p_commission_id uuid,
  p_transaction_id text,
  p_paid_by uuid
) returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  commission public.affiliate_commissions%rowtype;
  beneficiary public.affiliate_accounts%rowtype;
  payout_id uuid;
  available_paise bigint;
  minimum_paise integer;
begin
  if p_paid_by is null then raise exception 'admin identity is required'; end if;
  if p_transaction_id is null or length(trim(p_transaction_id)) = 0 or length(trim(p_transaction_id)) > 120 then
    raise exception 'a valid UPI transaction reference is required';
  end if;
  if extract(day from (now() at time zone 'Asia/Kolkata')) <> 25 then
    raise exception 'Affiliate payouts are processed on the 25th of each month';
  end if;

  select * into commission
    from public.affiliate_commissions
   where id = p_commission_id
   for update;
  if not found then raise exception 'commission not found'; end if;
  if commission.status <> 'approved' then raise exception 'commission must be approved before payout'; end if;
  if commission.eligible_date > now() then raise exception 'commission has not completed the 15-day review period'; end if;
  if commission.referrer_id is null then raise exception 'affiliate identity has been erased'; end if;

  select * into beneficiary
    from public.affiliate_accounts
   where user_id = commission.referrer_id
   for update;
  if not found or beneficiary.status <> 'active' then raise exception 'active affiliate account not found'; end if;
  if beneficiary.terms_version is distinct from 'affiliate-2026-11-11-v3'
     or beneficiary.privacy_version is distinct from 'privacy-2026-11-10'
  then
    raise exception 'affiliate must accept the current programme terms before payout';
  end if;
  if beneficiary.upi_id is null or length(trim(beneficiary.upi_id)) = 0
     or beneficiary.upi_name is null or length(trim(beneficiary.upi_name)) < 2
  then
    raise exception 'referrer must have a valid UPI ID and account-holder name';
  end if;

  select coalesce(minimum_payout_paise, 25000)
    into minimum_paise
    from public.affiliate_settings
   where id = 1;

  select coalesce(sum(commission_amount), 0)
    into available_paise
    from public.affiliate_commissions
   where referrer_id = commission.referrer_id
     and status = 'approved';

  if available_paise < coalesce(minimum_paise, 25000) then
    raise exception 'minimum payout threshold of ₹250 has not been reached';
  end if;

  insert into public.affiliate_payouts(
    user_id, amount, upi_id, upi_name, transaction_id, paid_by, paid_at, status, remarks
  ) values (
    commission.referrer_id, available_paise::integer, beneficiary.upi_id,
    beneficiary.upi_name, trim(p_transaction_id), p_paid_by, now(), 'paid',
    'Manual UPI payout processed after current affiliate terms acceptance'
  ) returning id into payout_id;

  update public.affiliate_commissions
     set status = 'paid', paid_date = now(), updated_at = now()
   where referrer_id = commission.referrer_id
     and status = 'approved';

  return payout_id;
end;
$$;

revoke all on function public.admin_pay_affiliate_commission(uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.admin_pay_affiliate_commission(uuid, text, uuid) to service_role;

commit;
