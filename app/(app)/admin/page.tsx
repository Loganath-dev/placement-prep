import Link from "next/link"
import { requireAdmin } from "@/lib/admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { PageHeader } from "@/app/page-header"
import { Card, CardContent } from "@/components/ui/card"

export const dynamic = "force-dynamic"
export default async function AdminHomePage() {
  await requireAdmin()
  let db: ReturnType<typeof createAdminClient>
  try {
    db = createAdminClient()
  } catch {
    return <AdminLoadFailure message="The admin overview is temporarily unavailable. Please contact the platform administrator." />
  }
  const now = new Date().toISOString()
  const [users, premium, affiliates, referrals, commissions] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("user_state").select("id", { count: "exact", head: true }).eq("premium", true).or(`premium_until.is.null,premium_until.gt.${now}`),
    db.from("affiliate_accounts").select("user_id", { count: "exact", head: true }).eq("status", "active"),
    db.from("profiles").select("id", { count: "exact", head: true }).not("referred_by", "is", null),
    db.from("affiliate_commissions").select("commission_amount,status"),
  ])
  const failedMetrics = [
    users.error ? "registered accounts" : null,
    premium.error ? "Premium accounts" : null,
    affiliates.error ? "affiliate accounts" : null,
    referrals.error ? "referral signups" : null,
    commissions.error ? "commission totals" : null,
  ].filter((value): value is string => Boolean(value))
  const totalCommission = (commissions.data ?? []).reduce((sum: number, row: { commission_amount: number; status: string }) => sum + (["pending", "approved", "paid"].includes(row.status) ? row.commission_amount : 0), 0)
  return <div className="mx-auto max-w-5xl space-y-7">
    <PageHeader eyebrow="Private administration" title="StudyBench admin" description="Owner-only controls and live platform overview." />
    {failedMetrics.length ? <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-800 dark:text-amber-200">
      Some platform metrics are temporarily unavailable. Please refresh the page or try again later.
    </div> : null}
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Metric label="Registered accounts" value={users.error ? "—" : users.count ?? 0} />
      <Metric label="Premium accounts" value={premium.error ? "—" : premium.count ?? 0} />
      <Metric label="Active affiliates" value={affiliates.error ? "—" : affiliates.count ?? 0} />
      <Metric label="Attributed signups" value={referrals.error ? "—" : referrals.count ?? 0} />
    </div>
    <Card><CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Affiliate management</p><p className="mt-1 text-sm text-muted-foreground">Applications, referral conversions, commissions, UPI details and monthly payouts.</p><p className="mt-2 text-sm font-semibold">Recorded commissions: {commissions.error ? "Unavailable" : `₹${(totalCommission / 100).toLocaleString("en-IN")}`}</p></div><Link href="/admin/referrals" className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Open affiliate management</Link></CardContent></Card>
    <Card><CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Academic content review</p><p className="mt-1 text-sm text-muted-foreground">Check question accuracy, review explanations and manage which questions are available to students.</p></div><Link href="/admin/content" className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Open content review</Link></CardContent></Card>
    <Card><CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Platform metrics</p><p className="mt-1 text-sm text-muted-foreground">Signups, learning engagement, conversion and payment ledger.</p></div><Link href="/admin/metrics" className="inline-flex rounded-lg border px-4 py-2 text-sm font-semibold">View metrics</Link></CardContent></Card>
  </div>
}
function AdminLoadFailure({ message }: { message: string }) {
  return <div className="mx-auto max-w-3xl space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
    <h2 className="font-semibold">Admin overview unavailable</h2>
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
}
function Metric({label,value}:{label:string;value:number | string}) { return <div className="rounded-xl border bg-card p-4"><p className="font-heading text-2xl font-bold tabular-nums">{value.toLocaleString("en-IN")}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div> }
