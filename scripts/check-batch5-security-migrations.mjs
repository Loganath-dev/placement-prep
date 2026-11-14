import { readFileSync } from 'node:fs';

const invite = readFileSync(
  'supabase/migrations/20261114041000_revoke_creator_invite_table_access.sql',
  'utf8',
).toLowerCase();
const indexes = readFileSync(
  'supabase/migrations/20261114042000_index_review_and_content_foreign_keys.sql',
  'utf8',
).toLowerCase();

const checks = [
  ['creator invite grants revoked from client roles', /revoke all privileges[\s\S]*from public, anon, authenticated, service_role/.test(invite)],
  ['creator redemption RPC remains service-role-only', /revoke all on function public\.redeem_creator_code\(uuid, text\)[\s\S]*from public, anon, authenticated/.test(invite) && /grant execute[\s\S]*to service_role/.test(invite)],
  ['creator invite migration does not delete or update invite data', !/\b(delete\s+from|update\s+public\.creator_invite_codes|truncate)\b/.test(invite)],
  ['reviewed_by foreign key index included', /idx_affiliate_commissions_reviewed_by[\s\S]*on public\.affiliate_commissions \(reviewed_by\)/.test(indexes)],
  ['reviewer_id review index included', /idx_content_question_reviews_reviewer_id[\s\S]*on public\.content_question_reviews \(reviewer_id\)/.test(indexes)],
  ['content author, publisher and reviewer indexes included', ['author_id', 'published_by', 'reviewer_id'].every((column) => new RegExp(`on public\\.content_questions \\(${column}\\)`).test(indexes))],
];

let failed = false;
for (const [label, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`);
  failed ||= !passed;
}
if (failed) process.exit(1);
console.log(`Batch 5 security migration checks passed (${checks.length}).`);
