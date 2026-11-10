-- Keep affiliate commission rows behind the authenticated affiliate API.
begin;
revoke select on table public.affiliate_commissions from public, anon, authenticated;
commit;