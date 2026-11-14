# StudyBench Free/Premium Access and Progress Integrity Review

## Scope

Reviewed the current application source in this release candidate, focusing on authoritative entitlements and the Free/Premium content gates.

## Verified in source

- `lib/premium-guard.ts` derives the signed-in identity from Supabase Auth and reads the user's own `user_state` entitlement. Expired and malformed expiries fail closed.
- `app/api/questions/route.ts` serves only `free` tier questions to Free users and both `free` and `premium` tiers to active Premium users. Answer keys and explanations are withheld from GET and graded server-side on POST.
- `app/api/content/chapter/route.ts` applies chapter access on the server and limits Free users to the first two lessons in the permitted starter chapter.
- `app/api/content/lesson-practice/route.ts` checks entitlement, chapter access, lesson visibility, previous chapter, previous lesson and completed learning cards before serving practice questions.
- `app/api/content/chapter-practice/route.ts`, `pyqs`, `mock`, and `daily-challenge` apply server-side entitlement limits.
- `lib/access.ts` centralizes the current Free quotas: 2 starter lessons per path, 1 starter chapter per path, 15 PYQs, 1 mock per series, 50 chapter-practice questions, and no coding judge problems for Free.
- `lib/premium-guard.ts` treats Premium as active only when the flag is true and expiry is absent or in the future; malformed expiry fails closed.

## Regression coverage added

`lib/access-contract.test.ts` codifies the Free/Premium access contract and expiry behavior. This is an additional test file; it has not been executed because dependencies are not installed in this environment.

## Confirmed unresolved security issue — do not launch until fixed

`lib/supabase/db.ts::syncCompanyProgress` still upserts the complete browser-generated `chapters` JSON and `mock_scores` into `company_progress`. `lib/store.tsx` invokes this from lesson-card completion, Recall completion, lesson practice, chapter quiz, chapter skip, bookmarks and mock submission.

Owner-scoped RLS prevents one user from writing another user's row, but does not prevent a user from forging their own `passed`, score, attempt count, XP-related progress, or completion timestamps. Existing server routes read this JSON to decide whether the next lesson/chapter is unlocked. Consequently, the current server gate can be bypassed by a user who can alter their own row.

Do not solve this by simply revoking client UPDATE: the current store sync would stop persisting progress and could appear to erase progress for learners. The required complete fix is a staged migration:

1. Create server-owned attempt and event tables with strict ownership and uniqueness constraints.
2. Serve question IDs without answer keys; submit only question IDs and selected options.
3. Grade on the server against the canonical question bank; calculate score and pass threshold server-side.
4. Persist verified attempt records and derive passed lesson/Recall/chapter state from those records.
5. Migrate existing progress as `legacy_unverified` without granting new unlocks based solely on client-written pass flags; preserve the historical display separately.
6. Change the client store to read derived progress and submit attempts, not write completion JSON.
7. Only after all app versions use the new flow, revoke direct authenticated UPDATE on progression state.
8. Add regression tests for forged scores, forged pass flags, replayed attempts, cross-user access and stale clients.

This refactor is intentionally not represented as complete in this ZIP. A superficial RLS change would break progress persistence; trusting the existing JSON would leave the vulnerability open.

## Free/Premium manual test matrix still required

| Scenario | Expected |
|---|---|
| Anonymous requests protected learning routes | 401 |
| Free user requests premium question tier | Premium question excluded / unavailable |
| Free user opens starter chapter | Allowed within starter lesson quota |
| Free user opens later chapter | 402 or locked response |
| Free user requests second mock in a series | Locked response |
| Free user requests PYQs | At most 15 after filters |
| Active Premium user requests full published content | Allowed within published-content rules |
| Expired Premium user requests Premium content | Treated as Free |
| Browser changes `state.premium` locally | No server entitlement change |
| User forges their own chapter progress JSON | **Current risk: not prevented yet** |

## Validation limitations

The project has no `node_modules` directory in this environment. The new Vitest test, complete test suite, TypeScript check, lint and production build have not been run. Browser tests with separate Free and Premium accounts and a live Razorpay test transaction remain necessary.

## Release decision

Not production-ready while client-writable progression JSON is authoritative. Free/Premium server entitlement gates are present in the reviewed routes, but full end-to-end verification has not been performed.
