-- Replace the single annual ₹249 plan with ₹299 / 6 months and ₹499 / 1 year.
-- Keep prior plan keys and payment rows for historical reconciliation.
begin;

update public.subscription_plans
set is_active=false,is_legacy=true,updated_at=now()
where plan_key='premium_annual_249';

insert into public.subscription_plans
(plan_key,name,amount_paise,currency,duration_days,is_active,is_legacy)
values
('premium_6_months_299','Premium — 6 months',29900,'INR',183,true,false),
('premium_annual_499','Premium — 1 year',49900,'INR',365,true,false)
on conflict (plan_key) do update set
name=excluded.name,amount_paise=excluded.amount_paise,currency=excluded.currency,
duration_days=excluded.duration_days,is_active=excluded.is_active,
is_legacy=excluded.is_legacy,updated_at=now();

-- The commission is fixed per plan, not a global percentage.
alter table public.affiliate_commissions
  drop constraint if exists affiliate_commissions_commission_amount_check;
alter table public.affiliate_commissions
  add constraint affiliate_commissions_commission_amount_check
  check (commission_amount in (2500,5000));

-- Keep the old global setting for backwards-compatible admin configuration;
-- payment processing now takes the reward from the server-resolved plan.
update public.affiliate_settings set commission_amount_paise=5000,updated_at=now()
where id=1;

comment on table public.subscription_plans is
'Active plans: ₹299 for 183 days and ₹499 for 365 days. Previous plans remain inactive for audit.';
comment on table public.affiliate_commissions is
'Fixed referral reward: ₹25 for a verified six-month purchase and ₹50 for a verified annual purchase.';

commit;
