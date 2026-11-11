-- StudyBench V11.7: payment entitlement preservation and commission reconciliation metadata.
begin;

alter table public.affiliate_commissions
  add column if not exists plan_key text;

comment on column public.affiliate_commissions.plan_key is
  'Server-resolved purchase plan identifier; nullable for historical commission rows.';

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
  current_premium boolean;
  current_expiry timestamptz;
  target_expiry timestamptz;
  state_exists boolean;
begin
  if p_payment_id is null or length(trim(p_payment_id)) = 0 or p_user_id is null then
    raise exception 'payment and user identifiers are required';
  end if;

  select * into payment_row
    from public.payments
   where payment_id = p_payment_id
   for update;

  if not found then raise exception 'payment ledger row not found'; end if;
  if payment_row.user_id is distinct from p_user_id then raise exception 'payment user mismatch'; end if;
  if payment_row.entitlement_applied_at is not null then
    return payment_row.premium_until;
  end if;

  if p_days is not null and p_days <= 0 then
    raise exception 'premium duration must be positive';
  end if;

  -- Serialize every paid grant for this user, including distinct concurrent payments.
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  select premium, premium_until
    into current_premium, current_expiry
    from public.user_state
   where id = p_user_id
   for update;
  state_exists := found;

  if p_days is null then
    -- Null duration is reserved for a historical lifetime purchase.
    target_expiry := null;
  elsif state_exists and current_premium and current_expiry is null then
    -- A null expiry on an active Premium row means lifetime access. Never
    -- downgrade it to a finite period when the user buys another plan.
    target_expiry := null;
  else
    target_expiry := greatest(coalesce(current_expiry, now()), now())
      + make_interval(days => p_days);
  end if;

  insert into public.user_state(id, premium, premium_until)
  values (p_user_id, true, target_expiry)
  on conflict (id) do update
    set premium = true, premium_until = excluded.premium_until;

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




-- Payout settlement requires the current accepted affiliate terms and locks the
-- consented payout destination row before taking a balance snapshot.
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
  if beneficiary.terms_version is distinct from 'affiliate-2026-11-10-v2'
     or beneficiary.privacy_version is distinct from 'privacy-2026-11-10'
  then
    raise exception 'affiliate must accept the current programme terms before payout';
  end if;
  if beneficiary.upi_id is null or length(trim(beneficiary.upi_id)) = 0 then
    raise exception 'referrer has not provided a UPI ID';
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
    user_id, amount, upi_id, transaction_id, paid_by, paid_at, status, remarks
  ) values (
    commission.referrer_id, available_paise::integer, beneficiary.upi_id,
    trim(p_transaction_id), p_paid_by, now(), 'paid',
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

-- Account deletion must fail closed until financial foreign keys preserve their
-- rows with nullable ON DELETE SET NULL references.
create or replace function public.assert_financial_erasure_schema_ready()
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  missing_nullable_columns integer;
  unsafe_foreign_keys integer;
begin
  select count(*) into missing_nullable_columns
  from (values
    ('payments', 'user_id'),
    ('affiliate_commissions', 'referrer_id'),
    ('affiliate_commissions', 'buyer_id'),
    ('affiliate_payouts', 'user_id'),
    ('affiliate_payouts', 'paid_by')
  ) as required(table_name, column_name)
  left join information_schema.columns c
    on c.table_schema = 'public'
   and c.table_name = required.table_name
   and c.column_name = required.column_name
  where c.column_name is null or c.is_nullable <> 'YES';

  select count(*) into unsafe_foreign_keys
  from (values
    ('payments', 'payments_user_id_fkey'),
    ('affiliate_commissions', 'affiliate_commissions_referrer_id_fkey'),
    ('affiliate_commissions', 'affiliate_commissions_buyer_id_fkey'),
    ('affiliate_payouts', 'affiliate_payouts_user_id_fkey'),
    ('affiliate_payouts', 'affiliate_payouts_paid_by_fkey')
  ) as required(table_name, constraint_name)
  left join pg_class tbl
    on tbl.relname = required.table_name
   and tbl.relnamespace = 'public'::regnamespace
  left join pg_constraint c
    on c.conrelid = tbl.oid
   and c.conname = required.constraint_name
   and c.contype = 'f'
  where c.oid is null or c.confdeltype <> 'n';

  if missing_nullable_columns > 0 or unsafe_foreign_keys > 0 then
    raise exception 'Financial account-erasure schema is not ready; preserve affiliate and payment audit records before deleting Auth identities';
  end if;
  return true;
end;
$$;

revoke all on function public.assert_financial_erasure_schema_ready() from public, anon, authenticated;
grant execute on function public.assert_financial_erasure_schema_ready() to service_role;


-- Supabase advisor follow-up: make auth.uid() a statement-level initPlan in
-- ownership policies. This preserves the same ownership rules while avoiding
-- per-row auth context evaluation on large scans.
drop policy if exists "profiles owner access" on public.profiles;
create policy "profiles owner access" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "company_progress owner access" on public.company_progress;
create policy "company_progress owner access" on public.company_progress
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "daily_challenges owner access" on public.daily_challenges;
create policy "daily_challenges owner access" on public.daily_challenges
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "mistakes owner access" on public.mistakes;
create policy "mistakes owner access" on public.mistakes
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "coding_attempts owner access" on public.coding_attempts;
create policy "coding_attempts owner access" on public.coding_attempts
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "drive_outcomes owner access" on public.drive_outcomes;
create policy "drive_outcomes owner access" on public.drive_outcomes
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "question_reports insert own" on public.question_reports;
create policy "question_reports insert own" on public.question_reports
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "question_reports select own" on public.question_reports;
create policy "question_reports select own" on public.question_reports
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "payments owner select" on public.payments;
create policy "payments owner select" on public.payments
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "user_state owner select" on public.user_state;
create policy "user_state owner select" on public.user_state
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "user_state owner insert" on public.user_state;
create policy "user_state owner insert" on public.user_state
  for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "user_state owner update" on public.user_state;
create policy "user_state owner update" on public.user_state
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "user_state owner delete" on public.user_state;
create policy "user_state owner delete" on public.user_state
  for delete to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "creator access owner select" on public.creator_access;
create policy "creator access owner select" on public.creator_access
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own affiliate account" on public.affiliate_accounts;
create policy "Users can read own affiliate account"
  on public.affiliate_accounts for select to authenticated
  using ((select auth.uid()) = user_id);

-- Direct commission SELECT was revoked in migration 0027. Remove the now
-- ineffective policy as well; user-facing aggregate data is served by the
-- authenticated server API and admin reads use the service role.
drop policy if exists "Referrers can view their own commissions" on public.affiliate_commissions;

drop policy if exists "Referrers can view their own payouts" on public.affiliate_payouts;
create policy "Referrers can view their own payouts" on public.affiliate_payouts
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users can insert own events" on public.analytics_events;
create policy "users can insert own events" on public.analytics_events
  for insert to authenticated
  with check (user_id = (select auth.uid()) or user_id is null);

-- Lock the legacy profile payout destination as defense in depth. Migration
-- 0030 moves the authoritative destination to affiliate_accounts; users must
-- not be able to mutate the old profile snapshot used by older code paths.
revoke update (upi_id, upi_name) on public.profiles from authenticated;

-- Replace the old auth.role() trigger guard with the current Postgres role.
-- Authorization remains: clients cannot set/change referral attribution;
-- trusted service-role and database migration operations can.
create or replace function public.protect_referred_by()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if current_user not in ('service_role', 'postgres') then
    if tg_op = 'INSERT' then
      new.referred_by := null;
    elsif tg_op = 'UPDATE' and new.referred_by is distinct from old.referred_by then
      new.referred_by := old.referred_by;
    end if;
  end if;

  if new.referred_by = new.id then
    new.referred_by := null;
  end if;
  return new;
end;
$$;

-- Fix the only mutable-search_path function reported by the live security advisor.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Cover the foreign keys reported by the live performance advisor.
create index if not exists idx_affiliate_commissions_buyer_id
  on public.affiliate_commissions(buyer_id);
create index if not exists idx_affiliate_payouts_paid_by
  on public.affiliate_payouts(paid_by);
create index if not exists idx_content_questions_created_by
  on public.content_questions(created_by);
create index if not exists idx_creator_invite_codes_redeemed_by
  on public.creator_invite_codes(redeemed_by);
create index if not exists idx_question_reports_user_id
  on public.question_reports(user_id);

-- A UPI transaction reference must not settle two different affiliate payouts.
-- Existing duplicate references were checked in the live project and none were found.
create unique index if not exists idx_affiliate_payouts_transaction_id_unique
  on public.affiliate_payouts (lower(trim(transaction_id)))
  where transaction_id is not null and trim(transaction_id) <> '';

commit;
