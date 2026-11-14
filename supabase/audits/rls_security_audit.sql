-- StudyBench V11.7 read-only Supabase security audit.
-- Run against the target project in the Supabase SQL Editor.
-- This file intentionally performs no writes and does not change policies.

-- 1. Public tables: RLS state and effective table privileges.
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  has_table_privilege('anon', c.oid, 'SELECT') as anon_can_select,
  has_table_privilege('anon', c.oid, 'INSERT') as anon_can_insert,
  has_table_privilege('anon', c.oid, 'UPDATE') as anon_can_update,
  has_table_privilege('anon', c.oid, 'DELETE') as anon_can_delete,
  has_table_privilege('authenticated', c.oid, 'SELECT') as authenticated_can_select,
  has_table_privilege('authenticated', c.oid, 'INSERT') as authenticated_can_insert,
  has_table_privilege('authenticated', c.oid, 'UPDATE') as authenticated_can_update,
  has_table_privilege('authenticated', c.oid, 'DELETE') as authenticated_can_delete
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r', 'p')
order by c.relname;

-- 2. Every policy, including permissive/restrictive mode and command scope.
select
  schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 3. Views: owner and security-invoker setting.
select
  schemaname, viewname, viewowner, definition
from pg_views
where schemaname = 'public'
order by viewname;

-- 4. SECURITY DEFINER routines: execution grants and configured search_path.
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer,
  p.proconfig as function_settings,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.prosecdef
order by p.proname;

-- 5. Financial consistency: duplicate non-empty UPI transaction references.
select lower(trim(transaction_id)) as normalized_transaction_id,
       count(*) as duplicate_count,
       array_agg(id order by created_at) as payout_ids
from public.affiliate_payouts
where transaction_id is not null and trim(transaction_id) <> ''
group by lower(trim(transaction_id))
having count(*) > 1;

-- 6. Affiliate commissions with orphaned/erased account identities.
select
  count(*) filter (where referrer_id is null) as erased_referrers,
  count(*) filter (where buyer_id is null) as erased_buyers,
  count(*) as total_commissions
from public.affiliate_commissions;

-- 7. Entitlement rows that may need manual reconciliation.
select
  count(*) filter (where premium = true and premium_until is null) as active_lifetime_or_unbounded,
  count(*) filter (where premium = true and premium_until <= now()) as expired_but_flagged_premium,
  count(*) filter (where premium = false and premium_until is not null) as inactive_with_expiry
from public.user_state;


-- 8. Sensitive column-level update grants. Review these together with triggers.
select
  has_column_privilege('authenticated', 'public.profiles', 'upi_id', 'UPDATE') as auth_can_update_profile_upi_id,
  has_column_privilege('authenticated', 'public.profiles', 'upi_name', 'UPDATE') as auth_can_update_profile_upi_name,
  has_column_privilege('authenticated', 'public.profiles', 'referred_by', 'UPDATE') as auth_can_update_referred_by,
  has_column_privilege('authenticated', 'public.user_state', 'premium', 'UPDATE') as auth_can_update_premium,
  has_column_privilege('authenticated', 'public.user_state', 'premium_until', 'UPDATE') as auth_can_update_premium_until;


-- 9. Financial foreign-key delete behavior. Retained financial rows should use
-- nullable references with ON DELETE SET NULL, not CASCADE.
select
  n.nspname as schema_name,
  c.relname as table_name,
  con.conname as constraint_name,
  con.confdeltype as delete_action_code,
  pg_get_constraintdef(con.oid) as definition
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where con.contype = 'f'
  and n.nspname = 'public'
  and c.relname in ('payments','affiliate_commissions','affiliate_payouts')
order by c.relname, con.conname;
