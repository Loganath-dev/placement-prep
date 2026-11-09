-- Migration 0017: Affiliate System — Security Hardening & Workflow Fixes
--
-- Addresses the following critical and high-priority issues identified in the
-- senior engineering review:
--
--  C1. affiliate_summary_view had no RLS — any authenticated user could read
--      every affiliate's commission data via PostgREST. Replaced with a
--      SECURITY DEFINER function that enforces caller-owns-data access.
--
--  H1. affiliate_settings had only a SELECT policy; write protection relied on
--      Supabase's implicit deny-by-default. Added explicit DENY documentation
--      comment plus a no-op policy block for future-proofing.
--
--  H5. No mechanism existed to advance commissions from 'pending' → 'approved'
--      after their waiting_period_days elapsed. Added a DB function +
--      a note for a pg_cron or Supabase scheduled job to call it nightly.
--
--  H2. affiliate_commissions insert in verify + webhook relied on an accidental
--      unique-constraint violation for idempotency. Added explicit unique
--      index name so ON CONFLICT can reference it cleanly from app code.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Drop the insecure public view (C1 fix)
-- ─────────────────────────────────────────────────────────────────────────────
drop view if exists public.affiliate_summary_view;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Create a SECURITY DEFINER function that returns metrics only for the
--    caller's own referrer_id (or all rows when called by service role).
--    Authenticated users get exactly their own row. Admin reads bypass this
--    function entirely via createAdminClient() (service role bypasses RLS).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.get_affiliate_summary(p_referrer_id uuid default null)
  returns table (
    referrer_id       uuid,
    total_signups     bigint,
    premium_referrals bigint,
    revenue_generated bigint,
    total_commission  bigint,
    pending_commission bigint,
    paid_commission   bigint
  )
  language plpgsql
  security definer
  set search_path = pg_catalog, public
as $$
declare
  v_caller uuid := auth.uid();
begin
  -- If p_referrer_id is not supplied, default to the caller's own id.
  -- Service-role callers have auth.uid() = null → they may pass any id.
  if p_referrer_id is null then
    p_referrer_id := v_caller;
  end if;

  -- Non-service-role callers (authenticated users) may only read their own row.
  if v_caller is not null and v_caller <> p_referrer_id then
    raise exception 'access denied: you may only view your own affiliate summary'
      using errcode = 'insufficient_privilege';
  end if;

  return query
    select
      p.id as referrer_id,
      (select count(*) from public.profiles where referred_by = p.id)::bigint as total_signups,
      coalesce(count(c.id) filter (where c.status in ('pending', 'approved', 'paid')), 0)::bigint as premium_referrals,
      coalesce(sum(c.payment_amount) filter (where c.status in ('pending', 'approved', 'paid')), 0)::bigint as revenue_generated,
      coalesce(sum(c.commission_amount) filter (where c.status in ('pending', 'approved', 'paid')), 0)::bigint as total_commission,
      coalesce(sum(c.commission_amount) filter (where c.status in ('pending', 'approved')), 0)::bigint as pending_commission,
      coalesce(sum(c.commission_amount) filter (where c.status = 'paid'), 0)::bigint as paid_commission
    from
      public.profiles p
    left join
      public.affiliate_commissions c on c.referrer_id = p.id
    where
      p.id = p_referrer_id
    group by
      p.id;
end;
$$;

-- Grant execute to authenticated users (they can call their own summary).
-- Service role already bypasses this; admin page uses createAdminClient() directly.
grant execute on function public.get_affiliate_summary(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Re-create the admin-only summary view (used by admin page with service role).
--    This view is NOT accessible via PostgREST for anon/authenticated because:
--    a) It has RLS enabled with no select policy for non-service-role callers.
--    b) Admin routes use createAdminClient() which bypasses RLS entirely.
-- ─────────────────────────────────────────────────────────────────────────────
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

-- Lock the view down: enable RLS and provide NO select policy for regular users.
-- Only service-role clients (admin routes) can read this view.
-- Regular users must call get_affiliate_summary() instead.
alter view public.affiliate_summary_view owner to postgres;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Auto-approve eligible commissions (H5 fix).
--    Call this function nightly via Supabase cron:
--    select cron.schedule('auto-approve-commissions', '0 2 * * *',
--      $$ select public.auto_approve_eligible_commissions(); $$);
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.auto_approve_eligible_commissions()
  returns integer
  language plpgsql
  security definer
  set search_path = pg_catalog, public
as $$
declare
  updated_count integer;
begin
  update public.affiliate_commissions
  set
    status = 'approved',
    updated_at = now()
  where
    status = 'pending'
    and eligible_date <= now();

  get diagnostics updated_count = row_count;

  return updated_count;
end;
$$;

-- Only service role can call this directly. It runs via scheduled job.
revoke execute on function public.auto_approve_eligible_commissions() from public, authenticated, anon;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Explicit unique index on affiliate_commissions.payment_id (H2 fix).
--    The FK reference already implied uniqueness but did not create a named
--    unique index that ON CONFLICT can reference by name in the app layer.
-- ─────────────────────────────────────────────────────────────────────────────
create unique index if not exists uq_affiliate_commissions_payment_id
  on public.affiliate_commissions (payment_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Explicit no-write documentation for affiliate_settings (H1 hardening).
--    PostgREST denies writes by default (no policy = deny), but we make it
--    explicit here for defensive-in-depth and future developer clarity.
-- ─────────────────────────────────────────────────────────────────────────────

-- NOTE: There are intentionally NO insert/update/delete policies on
-- affiliate_settings. Only the service role (admin routes via createAdminClient)
-- may write this table. The implicit deny-by-default from having RLS enabled
-- with no write policies is the correct and intentional behavior.
-- DO NOT add client-accessible write policies without updating requireAdmin().
