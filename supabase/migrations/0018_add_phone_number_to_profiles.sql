-- Migration 0018: Add phone number for affiliate payouts
alter table public.profiles
  add column if not exists phone_number text;
