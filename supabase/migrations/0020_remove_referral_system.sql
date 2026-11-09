-- Migration 0020: Remove Referral & Affiliate System
-- Drops all tables, columns, functions, triggers, and views related to referrals.

-- 1. Drop Triggers and Functions
drop trigger if exists trg_profiles_protect_referred_by on public.profiles;
drop function if exists public.protect_referred_by();
drop function if exists public.get_affiliate_summary(uuid);
drop function if exists public.auto_approve_eligible_commissions();

-- 2. Drop Views
drop view if exists public.affiliate_summary_view;

-- 3. Drop Tables
drop table if exists public.affiliate_payouts cascade;
drop table if exists public.affiliate_commissions cascade;
drop table if exists public.affiliate_settings cascade;
-- also from older iterations if any
drop table if exists public.referral_rewards cascade;
drop function if exists public.process_referral_reward() cascade;
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'subscriptions') then
    drop trigger if exists on_premium_subscription on public.subscriptions;
  end if;
end $$;

-- 4. Drop Enum Types
drop type if exists public.commission_status cascade;
drop type if exists public.payout_status cascade;

-- 5. Remove columns from profiles
-- NOTE: We use IF EXISTS to avoid errors if they were already removed or never existed
alter table public.profiles
  drop column if exists referred_by,
  drop column if exists upi_id,
  drop column if exists upi_name,
  drop column if exists signup_ip,
  drop column if exists affiliate_code,
  drop column if exists affiliate_status,
  drop column if exists affiliate_payout_email,
  drop column if exists affiliate_balance,
  drop column if exists affiliate_total_earned,
  drop column if exists premium_referrals;
