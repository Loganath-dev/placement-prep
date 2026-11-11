-- All previously issued unredeemed creator codes must be considered exposed.
-- Generate new cryptographically random codes outside source control and insert only hashes.
begin;
delete from public.creator_invite_codes where redeemed_by is null;
commit;
