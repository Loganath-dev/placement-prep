-- Migration 0015: Revoke creator access granted via the old 0011 batch (Creator 01–15).
--
-- WHY: The original 15 codes (Creator 01–15) from migration 0011 have been
-- rotated out by migration 0014. One of those codes (Creator 03) was already
-- redeemed before the rotation, granting a user a year of creator access.
-- That grant is now being revoked so the user returns to the free plan.
--
-- Only codes from the new 0014 batch (SB-XXXX-XXXX-XXXX format) should unlock
-- premium. Each code can only be redeemed once (enforced by the existing
-- redeem_creator_code function and the unique constraint on redeemed_by).
--
-- WHAT THIS MIGRATION DOES:
--   1. Deletes the creator_access row for any user whose invite came from
--      the old 0011 batch (Creator 01–15 code hashes).
--   2. Marks those old code hashes as permanently invalidated by setting
--      redeemed_at to NULL and redeemed_by to NULL — so they cannot be
--      accidentally re-inserted or re-used.
--
-- IMPORTANT: This only affects the one redeemed code (Creator 03). All other
-- 0011 codes were already deleted by migration 0014 (they were unredeemed).

-- Step 1: Remove creator_access for any user whose invite_hash is from the
-- old 0011 batch. This reverts those users to the free plan immediately.
delete from public.creator_access
where invite_hash in (
  'cb7b3298905b88f25f905a086a7d5da6264f5aa5554854ca4246d49748f84a26',  -- Creator 01
  '0f62456d19a2137db102422a8571054c638f44c9ad8f6c5cf48afbee0b649f17',  -- Creator 02
  'cbd25b3ef0c908faee0597efb6c9905dfa872727c841d6315cac7d52983caa9c',  -- Creator 03 (was redeemed)
  '8ea277bd3050d834c7919ccd623c37b642c1d74181b0182d676344899d6a35ed',  -- Creator 04
  '2c10969c1ab234dc658d04307fa0176bc45aaa4b8c4b7af196709db3bcbc95b6',  -- Creator 05
  '6575948e19e60f59018d2ca25f043cf4d8c2e6b958816e39730fed923de178b1',  -- Creator 06
  'a2c7f2d30efb578e4ccfa8077ff7037e694171e457d45bc123ae7e161c723681',  -- Creator 07
  '86dec8dd7b086048a5f4fa08993a36ba996e519105ef61d96b9c893d6383daff',  -- Creator 08
  '47bebf3ee94798247139b5e28aaceefa2db62c8817720a2994663c05cf1a2d13',  -- Creator 09
  'e43c427975314f43df59717423b9c55e70a3024a4a2fe65150cb42a652819175',  -- Creator 10
  'f362d30eea68ba255130fda7b5dbab3764a402cd6f92742cab46a00886b90cb9',  -- Creator 11
  '723d5afaf41f664e5560327561a76ca4f0ef1ce378f9f3b81582360364a127a8',  -- Creator 12
  '46aa2592ac16623cc4d28022dedd21b52f6dfa7a06975e7ef96db5c2f2e50793',  -- Creator 13
  'bd9c4332385e99cf7c838e56d6592af30d7a583bc42b957f4508d86e0561c02f',  -- Creator 14
  '220b451a1615591237e4c0293b114e4c5d73663ce01211ef724edec73acc9e42'   -- Creator 15
);

-- Step 2: For any old 0011 codes that are still in the table (i.e. Creator 03
-- which was redeemed and survived the 0014 cleanup), clear the redemption so
-- the row can be safely deleted without FK violations, then delete it.
-- We first remove the FK link by clearing redeemed_by/redeemed_at, then delete.
update public.creator_invite_codes
set redeemed_by = null, redeemed_at = null
where code_hash in (
  'cb7b3298905b88f25f905a086a7d5da6264f5aa5554854ca4246d49748f84a26',
  '0f62456d19a2137db102422a8571054c638f44c9ad8f6c5cf48afbee0b649f17',
  'cbd25b3ef0c908faee0597efb6c9905dfa872727c841d6315cac7d52983caa9c',
  '8ea277bd3050d834c7919ccd623c37b642c1d74181b0182d676344899d6a35ed',
  '2c10969c1ab234dc658d04307fa0176bc45aaa4b8c4b7af196709db3bcbc95b6',
  '6575948e19e60f59018d2ca25f043cf4d8c2e6b958816e39730fed923de178b1',
  'a2c7f2d30efb578e4ccfa8077ff7037e694171e457d45bc123ae7e161c723681',
  '86dec8dd7b086048a5f4fa08993a36ba996e519105ef61d96b9c893d6383daff',
  '47bebf3ee94798247139b5e28aaceefa2db62c8817720a2994663c05cf1a2d13',
  'e43c427975314f43df59717423b9c55e70a3024a4a2fe65150cb42a652819175',
  'f362d30eea68ba255130fda7b5dbab3764a402cd6f92742cab46a00886b90cb9',
  '723d5afaf41f664e5560327561a76ca4f0ef1ce378f9f3b81582360364a127a8',
  '46aa2592ac16623cc4d28022dedd21b52f6dfa7a06975e7ef96db5c2f2e50793',
  'bd9c4332385e99cf7c838e56d6592af30d7a583bc42b957f4508d86e0561c02f',
  '220b451a1615591237e4c0293b114e4c5d73663ce01211ef724edec73acc9e42'
);

-- Now we can safely delete the remaining 0011 code rows (Creator 03 survived
-- migration 0014 because it was redeemed; now we clean it up).
delete from public.creator_invite_codes
where code_hash in (
  'cb7b3298905b88f25f905a086a7d5da6264f5aa5554854ca4246d49748f84a26',
  '0f62456d19a2137db102422a8571054c638f44c9ad8f6c5cf48afbee0b649f17',
  'cbd25b3ef0c908faee0597efb6c9905dfa872727c841d6315cac7d52983caa9c',
  '8ea277bd3050d834c7919ccd623c37b642c1d74181b0182d676344899d6a35ed',
  '2c10969c1ab234dc658d04307fa0176bc45aaa4b8c4b7af196709db3bcbc95b6',
  '6575948e19e60f59018d2ca25f043cf4d8c2e6b958816e39730fed923de178b1',
  'a2c7f2d30efb578e4ccfa8077ff7037e694171e457d45bc123ae7e161c723681',
  '86dec8dd7b086048a5f4fa08993a36ba996e519105ef61d96b9c893d6383daff',
  '47bebf3ee94798247139b5e28aaceefa2db62c8817720a2994663c05cf1a2d13',
  'e43c427975314f43df59717423b9c55e70a3024a4a2fe65150cb42a652819175',
  'f362d30eea68ba255130fda7b5dbab3764a402cd6f92742cab46a00886b90cb9',
  '723d5afaf41f664e5560327561a76ca4f0ef1ce378f9f3b81582360364a127a8',
  '46aa2592ac16623cc4d28022dedd21b52f6dfa7a06975e7ef96db5c2f2e50793',
  'bd9c4332385e99cf7c838e56d6592af30d7a583bc42b957f4508d86e0561c02f',
  '220b451a1615591237e4c0293b114e4c5d73663ce01211ef724edec73acc9e42'
);
