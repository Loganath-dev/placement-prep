-- Single-use creator invites. Only hashes are stored; plaintext codes are
-- distributed out-of-band and cannot be recovered from the database.

create table if not exists public.creator_invite_codes (
  code_hash text primary key check (length(code_hash) = 64),
  label text not null,
  redeemed_by uuid references auth.users(id) on delete set null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint creator_code_redemption_pair check (
    (redeemed_by is null and redeemed_at is null)
    or (redeemed_by is not null and redeemed_at is not null)
  )
);

create table if not exists public.creator_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  invite_hash text unique references public.creator_invite_codes(code_hash),
  granted_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '1 year')
);

-- Safe when rerunning against a database where an earlier draft was applied.
alter table public.creator_access
  add column if not exists expires_at timestamptz;
update public.creator_access
  set expires_at = granted_at + interval '1 year'
  where expires_at is null;
alter table public.creator_access alter column expires_at set not null;

alter table public.creator_invite_codes enable row level security;
alter table public.creator_access enable row level security;

-- Users can confirm their own creator grant. Invite inventory is never exposed.
drop policy if exists "creator access owner select" on public.creator_access;
create policy "creator access owner select" on public.creator_access
  for select to authenticated using (auth.uid() = user_id);

-- Atomically claim one unused code. SECURITY DEFINER is restricted to the
-- service role and pins search_path to avoid object-shadowing attacks.
create or replace function public.redeem_creator_code(p_user_id uuid, p_code_hash text)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  claimed_hash text;
begin
  if exists (select 1 from public.creator_access where user_id = p_user_id) then
    return true;
  end if;

  update public.creator_invite_codes
  set redeemed_by = p_user_id, redeemed_at = now()
  where code_hash = p_code_hash and redeemed_by is null
  returning code_hash into claimed_hash;

  if claimed_hash is null then return false; end if;

  insert into public.creator_access(user_id, invite_hash, granted_at, expires_at)
  values (p_user_id, claimed_hash, now(), now() + interval '1 year');
  return true;
end;
$$;

revoke all on function public.redeem_creator_code(uuid, text) from public, anon, authenticated;
grant execute on function public.redeem_creator_code(uuid, text) to service_role;

insert into public.creator_invite_codes(code_hash, label) values
  ('cb7b3298905b88f25f905a086a7d5da6264f5aa5554854ca4246d49748f84a26', 'Creator 01'),
  ('0f62456d19a2137db102422a8571054c638f44c9ad8f6c5cf48afbee0b649f17', 'Creator 02'),
  ('cbd25b3ef0c908faee0597efb6c9905dfa872727c841d6315cac7d52983caa9c', 'Creator 03'),
  ('8ea277bd3050d834c7919ccd623c37b642c1d74181b0182d676344899d6a35ed', 'Creator 04'),
  ('2c10969c1ab234dc658d04307fa0176bc45aaa4b8c4b7af196709db3bcbc95b6', 'Creator 05'),
  ('6575948e19e60f59018d2ca25f043cf4d8c2e6b958816e39730fed923de178b1', 'Creator 06'),
  ('a2c7f2d30efb578e4ccfa8077ff7037e694171e457d45bc123ae7e161c723681', 'Creator 07'),
  ('86dec8dd7b086048a5f4fa08993a36ba996e519105ef61d96b9c893d6383daff', 'Creator 08'),
  ('47bebf3ee94798247139b5e28aaceefa2db62c8817720a2994663c05cf1a2d13', 'Creator 09'),
  ('e43c427975314f43df59717423b9c55e70a3024a4a2fe65150cb42a652819175', 'Creator 10'),
  ('f362d30eea68ba255130fda7b5dbab3764a402cd6f92742cab46a00886b90cb9', 'Creator 11'),
  ('723d5afaf41f664e5560327561a76ca4f0ef1ce378f9f3b81582360364a127a8', 'Creator 12'),
  ('46aa2592ac16623cc4d28022dedd21b52f6dfa7a06975e7ef96db5c2f2e50793', 'Creator 13'),
  ('bd9c4332385e99cf7c838e56d6592af30d7a583bc42b957f4508d86e0561c02f', 'Creator 14'),
  ('220b451a1615591237e4c0293b114e4c5d73663ce01211ef724edec73acc9e42', 'Creator 15')
on conflict (code_hash) do nothing;
