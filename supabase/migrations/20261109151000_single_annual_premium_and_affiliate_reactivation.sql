-- StudyBench annual Premium cutover. Forward-only; retain all historical payment rows.
begin;

create table if not exists public.subscription_plans (
  plan_key text primary key,
  name text not null,
  amount_paise integer not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  duration_days integer check (duration_days is null or duration_days > 0),
  is_active boolean not null default false,
  is_legacy boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.subscription_plans enable row level security;
revoke all on public.subscription_plans from anon, authenticated;
grant all on public.subscription_plans to service_role;

insert into public.subscription_plans
(plan_key,name,amount_paise,currency,duration_days,is_active,is_legacy)
values
('premium_3_months','Premium — 3 months (legacy)',14900,'INR',90,false,true),
('premium_yearly','Premium — 1 year (legacy)',49900,'INR',365,false,true),
('premium_lifetime_legacy','Premium — lifetime (legacy)',24900,'INR',null,false,true),
('premium_annual_249','StudyBench Premium',24900,'INR',365,true,false)
on conflict (plan_key) do update set
name=excluded.name,amount_paise=excluded.amount_paise,currency=excluded.currency,
duration_days=excluded.duration_days,is_active=excluded.is_active,
is_legacy=excluded.is_legacy,updated_at=now();

alter table public.payments
add column if not exists plan_key text references public.subscription_plans(plan_key) on delete restrict,
add column if not exists entitlement_days integer,
add column if not exists entitlement_granted_at timestamptz,
add column if not exists premium_until_after text;

update public.payments set
plan_key=case amount when 14900 then 'premium_3_months' when 49900 then 'premium_yearly'
when 24900 then 'premium_lifetime_legacy' else plan_key end,
entitlement_days=case amount when 14900 then 90 when 49900 then 365 else entitlement_days end,
entitlement_granted_at=coalesce(entitlement_granted_at,created_at)
where entitlement_granted_at is null;

alter table public.profiles
add column if not exists referred_by uuid references auth.users(id) on delete set null,
add column if not exists upi_id text,
add column if not exists upi_name text;
create index if not exists idx_profiles_referred_by on public.profiles(referred_by);

create or replace function public.protect_referred_by()
returns trigger language plpgsql set search_path=pg_catalog as $$
begin
  if current_user not in ('authenticated','anon') then return new; end if;
  if new.referred_by is not null and new.referred_by=new.id then new.referred_by:=null; end if;
  if tg_op='UPDATE' and old.referred_by is not null
    and new.referred_by is distinct from old.referred_by then new.referred_by:=old.referred_by; end if;
  return new;
end; $$;
drop trigger if exists trg_profiles_protect_referred_by on public.profiles;
create trigger trg_profiles_protect_referred_by before insert or update on public.profiles
for each row execute function public.protect_referred_by();

create table if not exists public.affiliate_settings (
 id integer primary key default 1 check(id=1),
 commission_amount_paise integer not null default 5000 check(commission_amount_paise=5000),
 minimum_payout_paise integer not null default 25000 check(minimum_payout_paise>=25000),
 waiting_period_days integer not null default 14 check(waiting_period_days between 0 and 90),
 is_enabled boolean not null default true,
 updated_at timestamptz not null default now()
);
insert into public.affiliate_settings(id) values(1) on conflict do nothing;
alter table public.affiliate_settings enable row level security;
revoke all on public.affiliate_settings from anon,authenticated;
grant all on public.affiliate_settings to service_role;

create table if not exists public.affiliate_commissions (
 id uuid primary key default gen_random_uuid(),
 referrer_id uuid not null references auth.users(id) on delete cascade,
 buyer_id uuid not null references auth.users(id) on delete cascade,
 payment_id text not null unique references public.payments(payment_id) on delete restrict,
 payment_amount integer not null check(payment_amount>0),
 commission_amount integer not null default 5000 check(commission_amount=5000),
 commission_rate integer,
 purchase_date timestamptz not null default now(),
 eligible_date timestamptz not null,
 paid_date timestamptz,
 status text not null default 'pending' check(status in ('pending','approved','paid','refunded','cancelled')),
 notes text,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check(referrer_id<>buyer_id)
);
create index if not exists idx_affiliate_commissions_referrer on public.affiliate_commissions(referrer_id);
create index if not exists idx_affiliate_commissions_status on public.affiliate_commissions(status);
alter table public.affiliate_commissions enable row level security;
drop policy if exists "Referrers can view their own commissions" on public.affiliate_commissions;
create policy "Referrers can view their own commissions" on public.affiliate_commissions
for select to authenticated using((select auth.uid())=referrer_id);
revoke all on public.affiliate_commissions from anon;
grant select on public.affiliate_commissions to authenticated;
grant all on public.affiliate_commissions to service_role;

create table if not exists public.affiliate_payouts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 amount integer not null check(amount>=25000),upi_id text not null,
 transaction_id text,payment_method text not null default 'UPI' check(payment_method='UPI'),
 paid_by uuid references auth.users(id) on delete set null,paid_at timestamptz,
 status text not null default 'processing' check(status in ('processing','paid','failed')),
 remarks text,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index if not exists idx_affiliate_payouts_user on public.affiliate_payouts(user_id);
alter table public.affiliate_payouts enable row level security;
drop policy if exists "Referrers can view their own payouts" on public.affiliate_payouts;
create policy "Referrers can view their own payouts" on public.affiliate_payouts
for select to authenticated using((select auth.uid())=user_id);
revoke all on public.affiliate_payouts from anon;
grant select on public.affiliate_payouts to authenticated;
grant all on public.affiliate_payouts to service_role;

create or replace function public.grant_payment_entitlement(p_payment_id text)
returns text language plpgsql security invoker set search_path=pg_catalog,public as $$
declare
 p public.payments%rowtype; current_premium boolean:=false; current_until text;
 existing_expiry timestamptz; new_expiry timestamptz;
begin
 select * into p from public.payments where payment_id=p_payment_id for update;
 if not found then raise exception 'verified payment not found'; end if;
 if p.entitlement_granted_at is not null then return p.premium_until_after; end if;
 if p.user_id is null then raise exception 'payment has no associated user'; end if;
 select premium,premium_until into current_premium,current_until
 from public.user_state where id=p.user_id for update;

 if p.entitlement_days is null then
   insert into public.user_state(id,premium,premium_until) values(p.user_id,true,null)
   on conflict(id) do update set premium=true,premium_until=null;
   new_expiry:=null;
 elsif coalesce(current_premium,false) and current_until is null then
   -- Preserve grandfathered non-expiring access.
   new_expiry:=null;
 else
   if current_until is not null then
     begin existing_expiry:=current_until::timestamptz;
     exception when others then existing_expiry:=null; end;
   end if;
   new_expiry:=greatest(coalesce(existing_expiry,now()),now())+make_interval(days=>p.entitlement_days);
   insert into public.user_state(id,premium,premium_until) values(p.user_id,true,new_expiry::text)
   on conflict(id) do update set premium=true,premium_until=excluded.premium_until;
 end if;
 update public.payments set entitlement_granted_at=now(),premium_until_after=new_expiry::text
 where payment_id=p_payment_id;
 return new_expiry::text;
end; $$;
revoke execute on function public.grant_payment_entitlement(text) from public,anon,authenticated;
grant execute on function public.grant_payment_entitlement(text) to service_role;

comment on table public.subscription_plans is 'One active annual Premium plan; inactive legacy rows remain for audit.';
comment on table public.affiliate_commissions is 'Fixed ₹50 commission per verified new annual purchase.';
commit;
