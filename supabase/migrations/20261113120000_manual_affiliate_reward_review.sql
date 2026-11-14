-- 0037: referral commissions require an explicit admin review before payout.
-- The 15-day cooling-off period remains mandatory; opening the admin page no longer approves rewards.
begin;

alter table public.affiliate_commissions
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

comment on column public.affiliate_commissions.reviewed_by is
  'Admin identity that manually verified and approved this referral reward.';
comment on column public.affiliate_commissions.reviewed_at is
  'Timestamp of the explicit admin approval after the cooling-off period.';

create or replace function public.admin_approve_affiliate_commission(
  p_commission_id uuid,
  p_approved_by uuid
) returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  commission public.affiliate_commissions%rowtype;
  beneficiary public.affiliate_accounts%rowtype;
  payment_row public.payments%rowtype;
  buyer_referrer uuid;
  approved_commission_id uuid;
begin
  if p_approved_by is null then
    raise exception 'admin identity is required';
  end if;

  select * into commission
    from public.affiliate_commissions
   where id = p_commission_id
   for update;
  if not found then raise exception 'commission not found'; end if;
  if commission.status <> 'pending' then raise exception 'commission is not awaiting review'; end if;
  if commission.eligible_date > now() then
    raise exception 'the 15-day referral review period has not completed';
  end if;
  if commission.referrer_id is null or commission.buyer_id is null then
    raise exception 'referrer or buyer identity has been erased';
  end if;
  if commission.referrer_id = commission.buyer_id then
    raise exception 'self-referral is not eligible';
  end if;

  select * into payment_row
    from public.payments
   where payment_id = commission.payment_id
   for update;
  if not found then raise exception 'verified payment ledger entry not found'; end if;
  if payment_row.user_id is distinct from commission.buyer_id then
    raise exception 'payment buyer does not match the referred student';
  end if;
  if payment_row.amount is distinct from commission.payment_amount then
    raise exception 'payment amount does not match the referral commission';
  end if;
  select referred_by into buyer_referrer
    from public.profiles
   where id = commission.buyer_id;
  if buyer_referrer is distinct from commission.referrer_id then
    raise exception 'buyer referral attribution does not match this commission';
  end if;

  select * into beneficiary
    from public.affiliate_accounts
   where user_id = commission.referrer_id
   for update;
  if not found or beneficiary.status <> 'active' then
    raise exception 'referrer affiliate account is not active';
  end if;

  update public.affiliate_commissions
     set status = 'approved',
         reviewed_by = p_approved_by,
         reviewed_at = now(),
         updated_at = now()
   where id = p_commission_id
   returning id into approved_commission_id;

  return approved_commission_id;
end;
$$;

revoke all on function public.admin_approve_affiliate_commission(uuid, uuid) from public, anon, authenticated;
grant execute on function public.admin_approve_affiliate_commission(uuid, uuid) to service_role;

commit;
