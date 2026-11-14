-- Affiliate data is private to trusted server routes. Keep RLS enabled and
-- grant only the backend service role the table privileges those routes use.
grant usage on schema public to service_role;

grant select, insert, update
  on table public.affiliate_accounts
  to service_role;

grant select, insert, update
  on table public.affiliate_commissions
  to service_role;

grant select
  on table public.affiliate_payouts, public.affiliate_settings
  to service_role;
