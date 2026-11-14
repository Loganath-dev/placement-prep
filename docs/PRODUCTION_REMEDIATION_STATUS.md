# Production remediation status — 2026-11-14

| Finding | Status | Evidence / next step |
|---|---|---|
| Creator invite direct grants | **Resolved** | Live privilege check: no direct table SELECT/INSERT for anon, authenticated, or service_role; redemption RPC EXECUTE only for service_role. |
| Five missing FK indexes | **Resolved** | All five index definitions confirmed in `pg_indexes`; review usage after representative traffic. |
| `20261114035209` migration provenance | **Unresolved** | Exact historical SQL not found in supplied source. Recover canonical original; do not recreate from effective grants. |
| Supabase leaked-password protection | **Unresolved** | Security advisor still warns disabled. Enable in Dashboard Auth settings and re-run advisor. |
| Backup/PITR and restore rehearsal | **Unverified** | Dashboard backup inventory/retention and isolated restore test required. No restore attempted. |
| Full app test/build gate | **Not run** | `node_modules` absent and prior dependency installation was blocked by registry DNS. Run frozen install, tests, typecheck, lint, build in network-enabled CI. |
| Browser/mobile/accessibility/load tests | **Not run** | Schedule controlled QA and load testing before release. |

The package is not a production-readiness certification. It includes source migrations, post-apply evidence notes, and owner runbook for the remaining account-level actions.
