-- 0025: Affiliate applications, consent records, unique links and ₹250 payouts.
begin;

alter table public.affiliate_settings
  alter column minimum_payout_paise set default 25000,
  alter column payout_day_of_month set default 25,
  alter column waiting_period_days set default 15;

update public.affiliate_settings
set minimum_payout_paise = 25000,
    payout_day_of_month = 25,
    updated_at = now()
where id = 1;

create table if not exists public.affiliate_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  referral_code text not null unique,
  status text not null default 'active' check (status in ('active','suspended')),
  terms_version text not null,
  privacy_version text not null,
  accepted_at timestamptz not null,
  upi_id text not null,
  upi_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(referral_code)) between 6 and 24),
  check (length(trim(upi_id)) between 3 and 120),
  check (length(trim(upi_name)) between 2 and 120)
);

create index if not exists idx_affiliate_accounts_code on public.affiliate_accounts(referral_code);
alter table public.affiliate_accounts enable row level security;
drop policy if exists "Users can read own affiliate account" on public.affiliate_accounts;
create policy "Users can read own affiliate account"
  on public.affiliate_accounts for select to authenticated
  using (auth.uid() = user_id);

-- Referral attribution must be set by trusted server code only.
comment on table public.affiliate_accounts is
  'Affiliate enrollment and versioned legal consent. Writes are service-role only.';

create or replace function public.admin_pay_affiliate_commission(
  p_commission_id uuid, p_transaction_id text, p_paid_by uuid
) returns uuid
language plpgsql security definer set search_path = pg_catalog, public
as $$
declare
  commission public.affiliate_commissions%rowtype;
  beneficiary public.profiles%rowtype;
  payout_id uuid;
  available_paise bigint;
  minimum_paise integer;
begin
  if extract(day from (now() at time zone 'Asia/Kolkata')) <> 25 then
    raise exception 'Affiliate payouts are processed on the 25th of each month';
  end if;
  select * into commission from public.affiliate_commissions where id = p_commission_id for update;
  if not found then raise exception 'commission not found'; end if;
  if commission.status <> 'approved' then raise exception 'commission must be approved before payout'; end if;
  select * into beneficiary from public.profiles where id = commission.referrer_id;
  if beneficiary.upi_id is null or length(trim(beneficiary.upi_id)) = 0 then raise exception 'referrer has not provided a UPI ID'; end if;
  select coalesce(minimum_payout_paise,25000) into minimum_paise from public.affiliate_settings where id = 1;
  select coalesce(sum(commission_amount),0) into available_paise
    from public.affiliate_commissions
   where referrer_id = commission.referrer_id and status = 'approved';
  if available_paise < coalesce(minimum_paise,25000) then raise exception 'minimum payout threshold of ₹250 has not been reached'; end if;
  insert into public.affiliate_payouts(user_id,amount,upi_id,transaction_id,paid_by,paid_at,status,remarks)
  values (commission.referrer_id,available_paise::integer,beneficiary.upi_id,nullif(trim(p_transaction_id),''),p_paid_by,now(),'paid','Manual UPI payout processed on the 25th of the month')
  returning id into payout_id;
  update public.affiliate_commissions set status = 'paid', paid_date = now(), updated_at = now()
   where referrer_id = commission.referrer_id and status = 'approved';
  return payout_id;
end;
$$;
revoke all on function public.admin_pay_affiliate_commission(uuid,text,uuid) from public, anon, authenticated;
grant execute on function public.admin_pay_affiliate_commission(uuid,text,uuid) to service_role;

commit;
