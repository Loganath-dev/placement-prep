-- Migration 0016: Affiliate System (V3)
-- Implements the robust manual-payout affiliate architecture.

-- 1. Global Settings Table
create table if not exists public.affiliate_settings (
  id integer primary key default 1 check (id = 1), -- Ensure only one row
  default_commission_rate integer not null default 10,
  minimum_payout_paise integer not null default 50000, -- ₹500
  waiting_period_days integer not null default 15,
  payout_day_of_month integer not null default 25,
  is_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Insert the initial settings row
insert into public.affiliate_settings (id) values (1) on conflict do nothing;

alter table public.affiliate_settings enable row level security;

-- Only admins (via service_role or admin routes) can write. Anyone can read.
create policy "affiliate_settings read access" on public.affiliate_settings
  for select to authenticated, anon
  using (true);

-- 2. Update Profiles
alter table public.profiles
  add column if not exists referred_by uuid references auth.users (id) on delete set null,
  add column if not exists upi_id text,
  add column if not exists upi_name text,
  add column if not exists signup_ip text;

-- 3. Commission Types and Table
create type public.commission_status as enum ('pending', 'approved', 'paid', 'refunded', 'cancelled');

create table if not exists public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users (id) on delete cascade,
  buyer_id uuid not null references auth.users (id) on delete cascade,
  payment_id text not null unique references public.payments (payment_id) on delete cascade,
  payment_amount integer not null, -- Total revenue from this sale
  commission_amount integer not null,
  commission_rate integer not null,
  purchase_date timestamptz not null default now(),
  eligible_date timestamptz not null,
  paid_date timestamptz,
  status public.commission_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_commissions_referrer on public.affiliate_commissions(referrer_id);
create index if not exists idx_commissions_status on public.affiliate_commissions(status);

alter table public.affiliate_commissions enable row level security;
create policy "Referrers can view their own commissions" on public.affiliate_commissions
  for select to authenticated
  using (auth.uid() = referrer_id);

-- 4. Payouts Table
create type public.payout_status as enum ('processing', 'paid', 'failed');

create table if not exists public.affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null,
  upi_id text not null,
  transaction_id text,
  payment_method text not null default 'UPI',
  paid_by uuid references auth.users (id) on delete set null,
  paid_at timestamptz,
  status public.payout_status not null default 'processing',
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payouts_user on public.affiliate_payouts(user_id);

alter table public.affiliate_payouts enable row level security;
create policy "Referrers can view their own payouts" on public.affiliate_payouts
  for select to authenticated
  using (auth.uid() = user_id);

-- 5. Affiliate Summary View
-- This view safely aggregates metrics for both the user dashboard and the admin dashboard.
create or replace view public.affiliate_summary_view as
select
  p.id as referrer_id,
  (select count(*) from public.profiles where referred_by = p.id) as total_signups,
  coalesce(count(c.id) filter (where c.status in ('pending', 'approved', 'paid')), 0) as premium_referrals,
  coalesce(sum(c.payment_amount) filter (where c.status in ('pending', 'approved', 'paid')), 0) as revenue_generated,
  coalesce(sum(c.commission_amount) filter (where c.status in ('pending', 'approved', 'paid')), 0) as total_commission,
  coalesce(sum(c.commission_amount) filter (where c.status in ('pending', 'approved')), 0) as pending_commission,
  coalesce(sum(c.commission_amount) filter (where c.status = 'paid'), 0) as paid_commission
from
  public.profiles p
left join
  public.affiliate_commissions c on c.referrer_id = p.id
group by
  p.id;
