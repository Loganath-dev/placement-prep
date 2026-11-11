-- Keep affiliate commissions and payout evidence when either account is erased.
-- Personal payout destinations remain in affiliate_accounts and are deleted
-- with the affiliate account; the payout snapshot remains for accounting.
begin;

alter table public.affiliate_commissions
  alter column referrer_id drop not null,
  alter column buyer_id drop not null;

alter table public.affiliate_commissions
  drop constraint if exists affiliate_commissions_referrer_id_fkey,
  drop constraint if exists affiliate_commissions_buyer_id_fkey;

alter table public.affiliate_commissions
  add constraint affiliate_commissions_referrer_id_fkey
    foreign key (referrer_id) references auth.users(id) on delete set null,
  add constraint affiliate_commissions_buyer_id_fkey
    foreign key (buyer_id) references auth.users(id) on delete set null;

alter table public.affiliate_payouts
  alter column user_id drop not null;

alter table public.affiliate_payouts
  drop constraint if exists affiliate_payouts_user_id_fkey;

alter table public.affiliate_payouts
  add constraint affiliate_payouts_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete set null;

comment on column public.affiliate_commissions.referrer_id is
  'Null after the referrer account is erased; retained for financial audit history.';
comment on column public.affiliate_commissions.buyer_id is
  'Null after the buyer account is erased; retained for financial audit history.';
comment on column public.affiliate_payouts.user_id is
  'Null after the affiliate account is erased; the payout snapshot remains retained.';

commit;
