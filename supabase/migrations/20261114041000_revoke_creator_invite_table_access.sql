-- Creator invite inventory is accessed only through the service-role-only
-- SECURITY DEFINER redemption RPC. The RPC runs with its owner's privileges;
-- no application role needs direct table access.
-- Keep RLS enabled and remove inherited/default table grants as defense in depth.

begin;

revoke all privileges on table public.creator_invite_codes
  from public, anon, authenticated, service_role;

revoke all on function public.redeem_creator_code(uuid, text)
  from public, anon, authenticated;
grant execute on function public.redeem_creator_code(uuid, text)
  to service_role;

commit;
