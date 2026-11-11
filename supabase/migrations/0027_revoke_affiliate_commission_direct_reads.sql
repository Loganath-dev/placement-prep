-- 0027: keep commission records behind the authenticated affiliate API.
-- RLS limits rows, not columns; the previous table-level SELECT permission
-- exposed buyer_id and payment_id to referrers who queried PostgREST directly.
begin;

revoke select on table public.affiliate_commissions from public, anon, authenticated;

commit;
