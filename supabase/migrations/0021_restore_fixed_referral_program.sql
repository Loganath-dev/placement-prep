-- 0021: Restore referral rewards with plan-specific fixed commissions.
-- ₹299 / 6 months => ₹25; ₹499 / 1 year => ₹50.
begin;

alter table public.profiles
  add column if not exists referred_by uuid references auth.users(id) on delete set null,
  add column if not exists upi_id text,
  add column if not exists upi_name text;
create index if not exists idx_profiles_referred_by on public.profiles(referred_by);

create table if not exists public.affiliate_settings (
  id integer primary key default 1 check (id = 1),
  minimum_payout_paise integer not null default 25000,
  waiting_period_days integer not null default 15,
  payout_day_of_month integer not null default 25,
  is_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.affiliate_settings(id) values (1) on conflict (id) do nothing;

do $$ begin
  create type public.commission_status as enum ('pending','approved','paid','refunded','cancelled');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.payout_status as enum ('processing','paid','failed');
exception when duplicate_object then null; end $$;

create table if not exists public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  payment_id text not null unique references public.payments(payment_id) on delete cascade,
  payment_amount integer not null,
  commission_amount integer not null check (commission_amount in (2500,5000)),
  commission_rate integer not null default 0,
  purchase_date timestamptz not null default now(),
  eligible_date timestamptz not null,
  paid_date timestamptz,
  status public.commission_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (referrer_id <> buyer_id)
);
create index if not exists idx_affiliate_commissions_referrer on public.affiliate_commissions(referrer_id);
create index if not exists idx_affiliate_commissions_status on public.affiliate_commissions(status);
create index if not exists idx_affiliate_commissions_eligible on public.affiliate_commissions(eligible_date) where status = 'pending';

create table if not exists public.affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount > 0),
  upi_id text not null,
  transaction_id text,
  payment_method text not null default 'UPI',
  paid_by uuid references auth.users(id) on delete set null,
  paid_at timestamptz,
  status public.payout_status not null default 'processing',
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_affiliate_payouts_user on public.affiliate_payouts(user_id);

alter table public.affiliate_settings enable row level security;
alter table public.affiliate_commissions enable row level security;
alter table public.affiliate_payouts enable row level security;
drop policy if exists "affiliate_settings read access" on public.affiliate_settings;
create policy "affiliate_settings read access" on public.affiliate_settings for select to authenticated using (true);
drop policy if exists "Referrers can view their own commissions" on public.affiliate_commissions;
create policy "Referrers can view their own commissions" on public.affiliate_commissions for select to authenticated using (auth.uid() = referrer_id);
drop policy if exists "Referrers can view their own payouts" on public.affiliate_payouts;
create policy "Referrers can view their own payouts" on public.affiliate_payouts for select to authenticated using (auth.uid() = user_id);

create or replace function public.protect_referred_by()
returns trigger language plpgsql set search_path = pg_catalog as $$
begin
  if tg_op = 'INSERT' and auth.role() <> 'service_role' then
    new.referred_by := null;
  elsif tg_op = 'UPDATE' and new.referred_by is distinct from old.referred_by and auth.role() <> 'service_role' then
    new.referred_by := old.referred_by;
  end if;
  if new.referred_by = new.id then new.referred_by := null; end if;
  return new;
end;
$$;
drop trigger if exists trg_profiles_protect_referred_by on public.profiles;
create trigger trg_profiles_protect_referred_by before insert or update on public.profiles for each row execute function public.protect_referred_by();

create or replace function public.auto_approve_eligible_commissions()
returns integer language plpgsql security definer set search_path = pg_catalog, public as $$
declare affected integer;
begin
  update public.affiliate_commissions set status = 'approved', updated_at = now()
   where status = 'pending' and eligible_date <= now();
  get diagnostics affected = row_count;
  return affected;
end;
$$;
revoke all on function public.auto_approve_eligible_commissions() from public, anon, authenticated;
grant execute on function public.auto_approve_eligible_commissions() to service_role;

create or replace function public.admin_pay_affiliate_commission(p_commission_id uuid, p_transaction_id text, p_paid_by uuid)
returns uuid language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  commission public.affiliate_commissions%rowtype;
  beneficiary public.profiles%rowtype;
  payout_id uuid;
  available_paise bigint;
  minimum_paise integer;
begin
  select * into commission from public.affiliate_commissions where id = p_commission_id for update;
  if not found then raise exception 'commission not found'; end if;
  if commission.status <> 'approved' then raise exception 'commission must be approved before payout'; end if;
  select * into beneficiary from public.profiles where id = commission.referrer_id;
  if beneficiary.upi_id is null or length(trim(beneficiary.upi_id)) = 0 then raise exception 'referrer has not provided a UPI ID'; end if;
  select coalesce(minimum_payout_paise,25000) into minimum_paise from public.affiliate_settings where id = 1;
  select coalesce(sum(commission_amount),0) into available_paise
    from public.affiliate_commissions
   where referrer_id = commission.referrer_id and status = 'approved';
  if available_paise < coalesce(minimum_paise,25000) then raise exception 'minimum payout threshold has not been reached'; end if;
  insert into public.affiliate_payouts(user_id,amount,upi_id,transaction_id,paid_by,paid_at,status,remarks)
  values (commission.referrer_id,available_paise::integer,beneficiary.upi_id,nullif(trim(p_transaction_id),''),p_paid_by,now(),'paid','Manual payout of approved referral balance')
  returning id into payout_id;
  update public.affiliate_commissions set status = 'paid', paid_date = now(), updated_at = now()
   where referrer_id = commission.referrer_id and status = 'approved';
  return payout_id;
end;
$$;
revoke all on function public.admin_pay_affiliate_commission(uuid,text,uuid) from public, anon, authenticated;
grant execute on function public.admin_pay_affiliate_commission(uuid,text,uuid) to service_role;

commit;
