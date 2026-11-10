-- Refund processing is not part of StudyBench's Premium purchase workflow.
-- Keep the historical enum label inert to avoid breaking dependent database objects.
begin;

drop function if exists public.reconcile_refunded_payment(text, integer);

alter table public.payments
  drop column if exists refunded_at;

commit;
