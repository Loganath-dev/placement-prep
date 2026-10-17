-- Persist real entitlement expiry and recent coding practice attempts.

alter table public.user_state
  add column if not exists premium_until text,
  add column if not exists coding_attempts jsonb not null default '[]'::jsonb;

