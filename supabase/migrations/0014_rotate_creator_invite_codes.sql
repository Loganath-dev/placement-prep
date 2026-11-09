-- Migration 0014: Revoke all unredeemed creator invite codes and insert 20 fresh ones.
--
-- WHY: Old codes (Creator 01–15) from migration 0011 are being rotated out.
-- Redeemed codes are left untouched — revoking them would strip creator access
-- from users who already used them. Only unredeemed codes are removed.
--
-- IMPORTANT: The plaintext codes below are distributed out-of-band and CANNOT
-- be recovered from this file — only SHA-256 hashes are stored.
-- Keep the plaintext codes in a secure password manager / 1Password vault.

-- Step 1: Delete all unredeemed old codes (redeemed_by IS NULL means nobody used it yet)
delete from public.creator_invite_codes
where redeemed_by is null;

-- Step 2: Insert 20 fresh creator invite codes.
-- Plaintext codes (distribute securely, NOT via public channels):
--
--   01: SB-JVNQ-P9U4-KKWJ
--   02: SB-4WQP-ATWZ-9H63
--   03: SB-3DLD-8WAR-LL2L
--   04: SB-2YAG-NQ2D-ZC2T
--   05: SB-REMC-GWJ6-KBF6
--   06: SB-J3E9-M9SG-USQ3
--   07: SB-FFSY-EXX4-KXZF
--   08: SB-XPBB-7XAS-CU5H
--   09: SB-CL5S-V3XY-BLH2
--   10: SB-GZBZ-BZY2-GY29
--   11: SB-K3G9-YB82-SPYU
--   12: SB-JB37-PN33-7ECG
--   13: SB-YF8V-MWM9-3LEG
--   14: SB-YZVB-GURZ-68E4
--   15: SB-2GRR-7GGT-SHUT
--   16: SB-TPRD-QP2H-5GKV
--   17: SB-KGYR-A2GQ-JN98
--   18: SB-LXBS-2A2V-BWKX
--   19: SB-SJRX-NUAL-ZXK7
--   20: SB-9GUC-Q5DJ-A3WZ

insert into public.creator_invite_codes(code_hash, label) values
  ('c63ecec508baadb81442a5df3124819bfbc3f87cd930392fb3671eff452b90c5', 'Creator 2026-01'),
  ('70fedc0d0234ff3272d874b4e57aa5001ef803f5324569448d6d66c0fafae8a6', 'Creator 2026-02'),
  ('4dcfbeb46cf3f4a1a88e2a4d3d9237e41c762a9d0bf5d688c26fd2f3768db9ff', 'Creator 2026-03'),
  ('3574dc722183938151219008ae26b397d2b6adc13ca5adaf3d280b453429f860', 'Creator 2026-04'),
  ('438bfa498345106a43b885e035dd44066aa6e2626ff1e7ae2e6aa92a0cb0d272', 'Creator 2026-05'),
  ('91336a3e4ca7872dcec7292c71bdd8a22d157287fcd9068d6413a392e0ae48e9', 'Creator 2026-06'),
  ('3a8cb1d45d5dd4599e1fbc47522501f8749c43eb925dbdd76613f3a9dac257d0', 'Creator 2026-07'),
  ('6cded0ba38403820d9a98bc81af8d9d4e3e3806dcdf32896b4618104750c7690', 'Creator 2026-08'),
  ('3a8e2f6626cc4fec8c4a4d29bf18c2fb979ee17779954d0e43528da8b466e46a', 'Creator 2026-09'),
  ('32b1726f2173c8a9a927e0030836cd2a6933f93c96f1bdd0f0d7621455b9bd81', 'Creator 2026-10'),
  ('c582f979fe651d18d389c9d19304d583d57b40e25df43c821030b30f0c39bce1', 'Creator 2026-11'),
  ('f86020a63c87fc8c5418b74c3fd5ba6d638ec47fce5fed803296d0398ec37f9d', 'Creator 2026-12'),
  ('f949ad5f8c2b8ee010d77da0c0e9c81796e31ed323b393ae43df1bc65f915e43', 'Creator 2026-13'),
  ('082a243acf11e1b600d3eebf6f25eee34b6b4ba4d31daa9221dab350f7086ede', 'Creator 2026-14'),
  ('a02b397f8402dcb11ddc5ababd3f623b335f659824c38191a6c579d63cf24c76', 'Creator 2026-15'),
  ('0bc8d76cf9591e87046b3be78a5c86dff4c41c814755bcb1f62d3dd6a8d25111', 'Creator 2026-16'),
  ('d98e49093ff84cc96a2219c598723b831d0b254d197953844a5c9229e864abad', 'Creator 2026-17'),
  ('1f2f9c6b4ddac7d2e9ced40a1dabf7d97c2ea8b54256fddd3aa7571939b2a8fd', 'Creator 2026-18'),
  ('ce979f22bc4796125385f25d3e0dd1fb84aaf77a50884710c33b39afa1be045a', 'Creator 2026-19'),
  ('07c8de7340ce50173ef316405f044d8c0552dce4a42777bed21256a20eeac94d', 'Creator 2026-20')
on conflict (code_hash) do nothing;
