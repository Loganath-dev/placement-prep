-- Complete the affiliate referral dashboard and delayed commission approval lifecycle.
begin;

create or replace function public.get_affiliate_summary()
returns table (
  total_signups bigint,
  premium_referrals bigint,
  pending_commission bigint,
  paid_commission bigint
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    (select count(*) from public.profiles p where p.referred_by = (select auth.uid())),
    (select count(*) from public.affiliate_commissions c
      where c.referrer_id = (select auth.uid())
        and c.status in ('pending','approved','paid')),
    coalesce((select sum(c.commission_amount) from public.affiliate_commissions c
      where c.referrer_id = (select auth.uid()) and c.status in ('pending','approved')), 0)::bigint,
    coalesce((select sum(c.commission_amount) from public.affiliate_commissions c
      where c.referrer_id = (select auth.uid()) and c.status = 'paid'), 0)::bigint;
$$;

revoke all on function public.get_affiliate_summary() from public, anon;
grant execute on function public.get_affiliate_summary() to authenticated;

create or replace function public.approve_eligible_affiliate_commissions()
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_count integer;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;

  update public.affiliate_commissions
  set status = 'approved', updated_at = now()
  where status = 'pending'
    and eligible_date <= now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.approve_eligible_affiliate_commissions() from public, anon, authenticated;
grant execute on function public.approve_eligible_affiliate_commissions() to service_role;

commit;
