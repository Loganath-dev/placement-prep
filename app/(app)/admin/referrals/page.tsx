import { PageHeader } from "@/app/page-header"
import { AdminReferralsTable, type AdminReferralRow } from "@/app/admin-referrals-table"
import { AdminAffiliateDirectory, type AffiliateAccountAdminRow, type AffiliateStudentAdminRow } from "@/app/admin-affiliate-directory"
import { requireAdminMfa } from "@/lib/admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { AFFILIATE_TERMS_VERSION, AFFILIATE_PRIVACY_VERSION } from "@/lib/affiliate-terms"
import { getCurrentTimestampMs } from "@/lib/time"

export const dynamic = "force-dynamic"

type PayoutRecord = {
  id: string
  user_id: string | null
  amount: number
  upi_id: string
  upi_name: string | null
  transaction_id: string | null
  status: string
  paid_by: string | null
  paid_at: string | null
  remarks: string | null
  created_at: string
}

type CommissionRecord = {
  id: string; referrer_id: string | null; buyer_id: string | null; payment_id: string
  payment_amount: number; commission_amount: number; eligible_date: string
  status: string; created_at: string; plan_key: string | null
}

export default async function AdminReferralsPage() {
  await requireAdminMfa()
  const now = getCurrentTimestampMs()
  const admin = createAdminClient()
  const [commissionsRes, accountsRes, referralsRes, payoutsRes] = await Promise.all([
    admin.from("affiliate_commissions").select("id,referrer_id,buyer_id,payment_id,payment_amount,commission_amount,plan_key,eligible_date,status,created_at").order("created_at", { ascending: false }),
    admin.from("affiliate_accounts").select("user_id,referral_code,status,upi_id,upi_name,accepted_at,created_at,terms_version,privacy_version").order("accepted_at", { ascending: false }),
    admin.from("profiles").select("id,name,referred_by,created_at").not("referred_by", "is", null).order("created_at", { ascending: false }),
    admin.from("affiliate_payouts").select("id,user_id,amount,upi_id,upi_name,transaction_id,status,paid_by,paid_at,remarks,created_at").order("created_at", { ascending: false }).limit(100),
  ])
  if (commissionsRes.error) throw new Error(`Could not load referral commissions: ${commissionsRes.error.message}`)
  if (accountsRes.error) throw new Error(`Could not load affiliate accounts: ${accountsRes.error.message}`)
  if (referralsRes.error) throw new Error(`Could not load referred students: ${referralsRes.error.message}`)
  if (payoutsRes.error) throw new Error(`Could not load payout settlement history: ${payoutsRes.error.message}`)

  const commissions = (commissionsRes.data ?? []) as CommissionRecord[]
  const payouts = (payoutsRes.data ?? []) as PayoutRecord[]
  const accounts = (accountsRes.data ?? []) as {
    user_id: string; referral_code: string; status: string; upi_id: string; upi_name: string
    accepted_at: string; created_at: string; terms_version: string; privacy_version: string
  }[]
  const students = (referralsRes.data ?? []) as { id: string; name: string | null; referred_by: string; created_at: string | null }[]
  const userIds = [...new Set([
    ...accounts.map((a) => a.user_id),
    ...students.map((s) => s.id),
    ...commissions.flatMap((row) => [row.referrer_id, row.buyer_id].filter((id): id is string => Boolean(id))),
    ...payouts.map((row) => row.user_id).filter((id): id is string => Boolean(id)),
  ])]
  const [profilesRes, statesRes, paymentsRes] = userIds.length ? await Promise.all([
    admin.from("profiles").select("id,name").in("id", userIds),
    admin.from("user_state").select("id,premium,premium_until").in("id", userIds),
    admin.from("payments").select("user_id,amount,plan_key,created_at").in("user_id", userIds).order("created_at", { ascending: false }),
  ]) : [
    { data: [] as { id: string; name: string | null }[], error: null },
    { data: [] as { id: string; premium: boolean; premium_until: string | null }[], error: null },
    { data: [] as { user_id: string; amount: number; plan_key: string | null; created_at: string }[], error: null },
  ]
  if (userIds.length && (profilesRes.error || statesRes.error || paymentsRes.error)) {
    throw new Error("Could not load complete affiliate identity, entitlement and payment reconciliation data.")
  }
  const profileRows = (profilesRes.data ?? []) as { id: string; name: string | null }[]
  const stateRows = (statesRes.data ?? []) as { id: string; premium: boolean; premium_until: string | null }[]
  const paymentRows = (paymentsRes.data ?? []) as { user_id: string; amount: number; plan_key: string | null; created_at: string }[]
  const names = new Map<string, string>(profileRows.map((p) => [p.id, p.name ?? ""] as const))
  const states = new Map<string, { id: string; premium: boolean; premium_until: string | null }>(stateRows.map((r) => [r.id, r] as const))
  const payments = new Map<string, { amount: number; plan_key: string | null; created_at: string }>()
  for (const payment of paymentRows) if (!payments.has(payment.user_id)) payments.set(payment.user_id, payment)
  const refCount = new Map<string, number>()
  const premiumCount = new Map<string, number>()
  for (const student of students) {
    refCount.set(student.referred_by, (refCount.get(student.referred_by) ?? 0) + 1)
    const state = states.get(student.id)
    const activePremium = Boolean(state?.premium && (!state.premium_until || Date.parse(state.premium_until) > now))
    if (activePremium) premiumCount.set(student.referred_by, (premiumCount.get(student.referred_by) ?? 0) + 1)
  }
  const commissionsByAffiliate = new Map<string, CommissionRecord[]>()
  for (const commission of commissions) {
    if (!commission.referrer_id) continue
    const current = commissionsByAffiliate.get(commission.referrer_id) ?? []
    current.push(commission)
    commissionsByAffiliate.set(commission.referrer_id, current)
  }
  const accountRows: AffiliateAccountAdminRow[] = accounts.map((a) => {
    const ownCommissions = commissionsByAffiliate.get(a.user_id) ?? []
    const approvedBuyers = new Set(ownCommissions
      .filter((row) => ["pending", "approved", "paid"].includes(row.status))
      .map((row) => row.buyer_id).filter((id): id is string => Boolean(id)))
    return {
      ...a, name: names.get(a.user_id) ?? "", referrals_count: refCount.get(a.user_id) ?? 0,
      premium_count: premiumCount.get(a.user_id) ?? 0,
      premium_purchases_count: approvedBuyers.size,
      pending_commission_paise: ownCommissions.filter((row) => row.status === "pending").reduce((sum, row) => sum + row.commission_amount, 0),
      approved_unpaid_paise: ownCommissions.filter((row) => row.status === "approved").reduce((sum, row) => sum + row.commission_amount, 0),
      paid_commission_paise: ownCommissions.filter((row) => row.status === "paid").reduce((sum, row) => sum + row.commission_amount, 0),
      terms_current: a.terms_version === AFFILIATE_TERMS_VERSION && a.privacy_version === AFFILIATE_PRIVACY_VERSION,
    }
  })
  const accountByIdForStudents = new Map(accounts.map((account) => [account.user_id, account] as const))
  const commissionByBuyer = new Map<string, CommissionRecord>()
  for (const commission of commissions) {
    if (commission.buyer_id && ["pending", "approved", "paid"].includes(commission.status) && !commissionByBuyer.has(commission.buyer_id)) {
      commissionByBuyer.set(commission.buyer_id, commission)
    }
  }
  const studentRows: AffiliateStudentAdminRow[] = students.map((s) => {
    const referrer = accountByIdForStudents.get(s.referred_by)
    const payment = payments.get(s.id)
    const commission = commissionByBuyer.get(s.id)
    return {
      id: s.id, name: names.get(s.id) || s.name || "StudyBench student", referred_by: s.referred_by,
      referrer_name: names.get(s.referred_by) || "Affiliate account", referral_code: referrer?.referral_code ?? "Code unavailable",
      joined_at: s.created_at,
      premium: Boolean(states.get(s.id)?.premium && (!states.get(s.id)?.premium_until || Date.parse(states.get(s.id)!.premium_until!) > now)),
      premium_until: states.get(s.id)?.premium_until ?? null,
      purchase_amount: payment?.amount ?? null,
      plan_label: getPlanLabel(commission?.plan_key ?? payment?.plan_key ?? null, commission?.payment_amount ?? payment?.amount ?? null),
      payment_status: payment ? "Captured" : "No purchase",
      total_referred_by_referrer: refCount.get(s.referred_by) ?? 0,
    }
  })
  const accountById = new Map(accounts.map((account) => [account.user_id, account] as const))
  const rows: AdminReferralRow[] = commissions.map((row) => {
    const account = accountById.get(row.referrer_id ?? "")
    return { ...row, plan_label: getPlanLabel(row.plan_key, row.payment_amount), referrer_name: names.get(row.referrer_id ?? "") ?? "", buyer_name: row.buyer_id ? names.get(row.buyer_id) ?? "Student" : "Erased account", upi_id: account?.upi_id ?? "", upi_name: account?.upi_name ?? "" }
  })
  const sum = (status: string) => commissions.filter((c) => c.status === status).reduce((n, c) => n + c.commission_amount, 0)

  return <div className="space-y-7">
    <PageHeader eyebrow="Admin · StudyBench operations" title="Affiliate management" description="Review affiliate applications, every referred student, Premium conversions, commission balances and manual UPI payouts." />
    <AdminAffiliateDirectory accounts={accountRows} students={studentRows} totalCommissions={commissions.length} pendingPaise={sum("pending")} approvedPaise={sum("approved")} paidPaise={sum("paid")} />
    <section className="space-y-3"><PageHeader eyebrow="Monthly settlement" title="Payout queue" description="Minimum ₹250 approved balance. Manual UPI transfers are processed on the 25th of each month; enter the transaction reference after transferring." /><AdminReferralsTable rows={rows} /></section>
    <section className="space-y-3">
      <PageHeader eyebrow="Financial audit trail" title="Payout settlement history" description="Latest 100 payout records, including destination snapshots and UPI transaction references. Records remain available when an account is erased." />
      <Card><CardContent className="overflow-x-auto p-0">
        {payouts.length ? <table className="w-full min-w-[58rem] text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="px-4 py-3">Affiliate</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">UPI destination snapshot</th><th className="px-4 py-3">Transaction reference</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Processed by</th><th className="px-4 py-3">Paid / recorded</th>
          </tr></thead>
          <tbody>{payouts.map((row) => <tr key={row.id} className="border-b last:border-0">
            <td className="px-4 py-3">{names.get(row.user_id ?? "") ?? (row.user_id ? row.user_id.slice(0, 8) : "Erased account")}</td>
            <td className="px-4 py-3 font-semibold">₹{(row.amount / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td className="px-4 py-3"><span className="block font-medium">{row.upi_name || "Name not recorded"}</span><span className="text-xs text-muted-foreground">{row.upi_id}</span></td>
            <td className="px-4 py-3 font-mono text-xs">{row.transaction_id ?? "Not recorded"}</td>
            <td className="px-4 py-3 capitalize">{row.status}</td>
            <td className="px-4 py-3">{names.get(row.paid_by ?? "") ?? (row.paid_by ? row.paid_by.slice(0, 8) : "Unknown")}</td>
            <td className="px-4 py-3">{new Date(row.paid_at ?? row.created_at).toLocaleString("en-IN")}</td>
          </tr>)}</tbody>
        </table> : <p className="p-6 text-sm text-muted-foreground">No payout settlements recorded yet.</p>}
      </CardContent></Card>
    </section>
  </div>
}

function getPlanLabel(planKey: string | null, amountPaise: number | null): string {
  if (planKey === "premium_6_months_299" || amountPaise === 29900) return "6-month Premium (₹299)"
  if (planKey === "premium_annual_499" || amountPaise === 49900) return "1-year Premium (₹499)"
  if (planKey === "premium_annual_249" || amountPaise === 24900) return "Legacy 1-year Premium (₹249)"
  if (planKey === "premium_lifetime_249") return "Legacy lifetime Premium"
  return amountPaise ? `Premium purchase (${(amountPaise / 100).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })})` : "No Premium purchase"
}
