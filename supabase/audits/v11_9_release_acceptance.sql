-- Read-only StudyBench V11.9 release acceptance checks.
-- Run on staging after migrations 0034-0036. No data or schema is changed.

-- 1) Migration-specific content governance columns.
select c.column_name, c.is_nullable, c.data_type
from information_schema.columns c
where c.table_schema = 'public'
  and c.table_name = 'content_questions'
  and c.column_name in (
    'content_kind', 'source_url', 'source_checked_at', 'author_id',
    'reviewer_id', 'reviewed_at', 'review_notes', 'version', 'quality_flags'
  )
order by c.column_name;

-- 2) Payment/affiliate reliability schema and required function signatures.
select c.table_name, c.column_name, c.is_nullable, c.data_type
from information_schema.columns c
where c.table_schema = 'public'
  and ((c.table_name = 'affiliate_commissions' and c.column_name = 'plan_key'))
order by c.table_name, c.column_name;

select n.nspname as schema_name, p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as arguments,
       has_function_privilege('anon', p.oid, 'execute') as anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'execute') as authenticated_can_execute,
       has_function_privilege('service_role', p.oid, 'execute') as service_role_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'grant_premium_for_payment',
    'admin_pay_affiliate_commission',
    'assert_financial_erasure_schema_ready'
  )
order by p.proname;

-- 3) Expected indexes. Missing rows indicate the migration/index is not ready.
select expected.index_name,
       to_regclass('public.' || expected.index_name) is not null as exists
from (values
  ('idx_affiliate_commissions_buyer_id'),
  ('idx_affiliate_payouts_paid_by'),
  ('idx_content_questions_created_by'),
  ('idx_creator_invite_codes_redeemed_by'),
  ('idx_question_reports_user_id'),
  ('idx_affiliate_payouts_transaction_id_unique')
) as expected(index_name)
order by expected.index_name;

-- 4) Duplicate normalized payout transaction references must be zero.
select lower(trim(transaction_id)) as normalized_transaction_id, count(*) as rows
from public.affiliate_payouts
where transaction_id is not null and trim(transaction_id) <> ''
group by lower(trim(transaction_id))
having count(*) > 1;

-- 5) Profile payout destination must not be directly updateable by authenticated.
select has_column_privilege('authenticated', 'public.profiles', 'upi_id', 'UPDATE') as authenticated_can_update_legacy_upi_id,
       has_column_privilege('authenticated', 'public.profiles', 'upi_name', 'UPDATE') as authenticated_can_update_legacy_upi_name;

-- 6) All public application tables should retain RLS.
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and rowsecurity = false
order by tablename;
