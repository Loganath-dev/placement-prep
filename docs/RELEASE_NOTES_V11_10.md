# StudyBench V11.10 — local ZIP hardening

This update is a source-archive change only. It has not been pushed to GitHub, deployed to Vercel, or applied to Supabase.

## Code changes

- Replaced the non-atomic Upstash sorted-set pipeline with a single Redis Lua `EVAL` command. Pruning old entries, checking the count, adding the current hit and setting key expiry now happen atomically.
- Added a 5-second Upstash request timeout and retained fail-closed behavior when Redis is unavailable in production. In-memory fallback remains limited to non-production environments.
- Added focused rate-limit adapter tests for atomic command construction, limit denial, production outage behavior, non-production fallback and malformed Redis responses.
- Made the admin MFA assurance response check null-safe.
- Pinned the package manifest to Next.js/eslint-config-next 16.4.5, React/React DOM 19.2.9, Vitest 4.1.12 and Vite 8.1.6; declared Node >=22.12 and pnpm 10.28.0.
- Removed unused Cloudflare OpenNext and Wrangler packages from the Vercel-only project configuration to avoid carrying a second deployment adapter and its transitive toolchain.
- Added dependency security overrides for transitive packages identified by the CI audit and updated CI to run on `chore/root-cleanup-canonical-app`.

## Outstanding dependency step

The local package registry was unavailable during this pass. `pnpm-lock.yaml` remains the pre-upgrade lockfile and is intentionally not hand-edited. Run `pnpm install --no-frozen-lockfile` on a network-enabled workstation, then run `pnpm check:release-deps` and `pnpm audit --audit-level high`. Do not use `pnpm install --frozen-lockfile` until the regenerated lockfile has been saved.

## Release decision

**HOLD.** No live database migration, backup restore, CAPTCHA setup, Razorpay test transaction, load test, device sync test, browser accessibility run or production deployment was performed. Follow the V11.9 release blocker and staging runbooks.
