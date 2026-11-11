import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"

const migration = readFileSync(
  new URL("../supabase/migrations/0036_payment_reliability_and_plan_identity.sql", import.meta.url),
  "utf8",
)

describe("V11.7 payment reliability migration", () => {
  it("preserves active lifetime entitlements when a finite plan is purchased", () => {
    expect(migration).toContain("state_exists and current_premium and current_expiry is null")
    expect(migration).toContain("target_expiry := null")
    expect(migration).toContain("Never downgrade it to a finite period")
  })

  it("serializes distinct payment grants for the same user", () => {
    expect(migration).toContain("pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0))")
    expect(migration).toContain("for update")
  })

  it("keeps payment grants idempotent and service-role only", () => {
    expect(migration).toContain("payment_row.entitlement_applied_at is not null")
    expect(migration).toContain("revoke all on function public.grant_premium_for_payment")
    expect(migration).toContain("grant execute on function public.grant_premium_for_payment")
  })

  it("adds nullable plan identity without rewriting historical commission records", () => {
    expect(migration).toContain("add column if not exists plan_key text")
  })

  it("hardens live RLS policies and function search paths without widening access", () => {
    expect(migration).toContain("using ((select auth.uid()) = id)")
    expect(migration).toContain("current_user not in ('service_role', 'postgres')")
    expect(migration).toContain("revoke update (upi_id, upi_name) on public.profiles from authenticated")
    expect(migration).toContain("set search_path = pg_catalog")
    expect(migration).not.toMatch(/auth\.role\(\)\s*(?:<>|=)/)
    expect(migration).toContain('drop policy if exists "Referrers can view their own commissions"')
  })

  it("adds indexes for the five foreign keys flagged by the live advisor", () => {
    expect(migration).toContain("idx_affiliate_commissions_buyer_id")
    expect(migration).toContain("idx_affiliate_payouts_paid_by")
    expect(migration).toContain("idx_content_questions_created_by")
    expect(migration).toContain("idx_creator_invite_codes_redeemed_by")
    expect(migration).toContain("idx_question_reports_user_id")
    expect(migration).toContain("idx_affiliate_payouts_transaction_id_unique")
  })

  it("fails closed on account erasure until financial references are nullable SET NULL", () => {
    expect(migration).toContain("create or replace function public.assert_financial_erasure_schema_ready()")
    expect(migration).toContain("affiliate_commissions_referrer_id_fkey")
    expect(migration).toContain("affiliate_payouts_user_id_fkey")
    expect(migration).toContain("c.confdeltype <> 'n'")
    expect(migration).toContain("grant execute on function public.assert_financial_erasure_schema_ready() to service_role")
  })

  it("requires updated affiliate terms before payout settlement", () => {
    expect(migration).toContain("affiliate-2026-11-10-v2")
    expect(migration).toContain("affiliate must accept the current programme terms before payout")
    expect(migration).toContain("revoke all on function public.admin_pay_affiliate_commission(uuid, text, uuid)")
    expect(migration).toContain("grant execute on function public.admin_pay_affiliate_commission(uuid, text, uuid) to service_role")
    expect(migration).toContain("commission has not completed the 15-day review period")
    expect(migration).toContain("where user_id = commission.referrer_id")
    expect(migration).toContain("for update")
  })
})

describe("V11.7 operational audit assets", () => {
  it("ships a read-only RLS audit query", () => {
    const audit = readFileSync(new URL("../supabase/audits/rls_security_audit.sql", import.meta.url), "utf8")
    expect(audit).toContain("from pg_policies")
    expect(audit).toContain("p.prosecdef")
    expect(audit).toContain("has_table_privilege")
    expect(audit).not.toMatch(/\b(insert|update|delete|alter|drop)\s+(into|table|policy|function)/i)
  })

  it("ships backup restore and load-test procedures", () => {
    const runbook = readFileSync(new URL("../docs/PRODUCTION_BACKUP_RESTORE_AND_RELEASE_RUNBOOK.md", import.meta.url), "utf8")
    const load = readFileSync(new URL("../tests/load/public-smoke.k6.js", import.meta.url), "utf8")
    expect(runbook).toContain("Restore rehearsal")
    expect(runbook).toContain("0036_payment_reliability_and_plan_identity.sql")
    expect(load).toContain("http_req_duration")
    expect(load).toContain("BASE_URL")
  })
})
