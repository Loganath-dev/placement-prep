-- Persist the server-resolved purchase plan on each captured payment so admin
-- referral reports can reconcile the exact plan even when a commission row is
-- absent (for example, a legacy or disabled affiliate account).
begin;

alter table public.payments
  add column if not exists plan_key text;

update public.payments as payment
   set plan_key = commission.plan_key
  from public.affiliate_commissions as commission
 where commission.payment_id = payment.payment_id
   and payment.plan_key is null
   and commission.plan_key is not null;

comment on column public.payments.plan_key is
  'Server-resolved Razorpay purchase plan key captured with the payment ledger row.';

commit;
