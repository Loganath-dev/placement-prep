-- Restore approved one-year access for historical ₹249 purchases.
begin;

update public.payments
   set entitlement_days = 365,
       premium_until = created_at + interval '365 days',
       entitlement_applied_at = coalesce(entitlement_applied_at, created_at)
 where amount = 24900
   and refunded_at is null;

with valid_annual_access as (
  select user_id, max(created_at + interval '365 days') as premium_until
    from public.payments
   where amount = 24900
     and refunded_at is null
     and user_id is not null
   group by user_id
)
update public.user_state state
   set premium = true,
       premium_until = valid_annual_access.premium_until::text
  from valid_annual_access
 where state.id = valid_annual_access.user_id;

commit;