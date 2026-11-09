import { requireAdmin } from "@/lib/admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { AdminPayoutForm } from "@/components/app/admin-payout-form"

export const dynamic = "force-dynamic"

export default async function AdminAffiliatesPage() {
  await requireAdmin()
  const admin = createAdminClient()
  const [{ data: settings }, { data: commissions }, { data: profiles }, { data: payouts }] = await Promise.all([
    admin.from("affiliate_settings").select("is_enabled,minimum_payout_paise,waiting_period_days").eq("id",1).maybeSingle(),
    admin.from("affiliate_commissions").select("id,referrer_id,payment_id,payment_amount,commission_amount,eligible_date,status,created_at").order("created_at",{ascending:false}).limit(1000),
    admin.from("profiles").select("id,name,upi_id,upi_name"),
    admin.from("affiliate_payouts").select("id,user_id,amount,transaction_id,status,created_at").order("created_at",{ascending:false}).limit(200),
  ])
  const byId = new Map((profiles ?? []).map(profile => [profile.id, profile]))
  const groups = new Map()
  for (const row of commissions ?? []) {
    const profile = byId.get(row.referrer_id)
    const group = groups.get(row.referrer_id) ?? {
      referrerId: row.referrer_id,
      name: profile?.name ?? "Student",
      upiId: profile?.upi_id ?? null,
      total: 0, approved: 0, pending: 0, paid: 0, rows: [],
    }
    group.total += Number(row.commission_amount)
    if (row.status === "approved") group.approved += Number(row.commission_amount)
    if (row.status === "pending") group.pending += Number(row.commission_amount)
    if (row.status === "paid") group.paid += Number(row.commission_amount)
    group.rows.push(row)
    groups.set(row.referrer_id, group)
  }
  const totalCommission = [...groups.values()].reduce((sum, group) => sum + group.total, 0)
  const minimum = Number(settings?.minimum_payout_paise ?? 25000)

  return <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
    <div><h1 className="font-heading text-3xl font-bold">Affiliate administration</h1><p className="mt-1 text-sm text-muted-foreground">Fixed ₹50 per verified annual purchase. Payouts are manual via UPI.</p></div>
    <div className="grid gap-3 sm:grid-cols-3">
      <Metric label="Programme" value={settings?.is_enabled ? "Enabled" : "Disabled"} />
      <Metric label="Commission accrued" value={rupees(totalCommission)} />
      <Metric label="Minimum payout" value={rupees(minimum)} />
    </div>
    {!settings?.is_enabled ? <p className="rounded-lg border border-warning/40 p-3 text-sm">Affiliate programme is disabled.</p> : null}
    <section className="space-y-3">
      <h2 className="font-heading text-xl font-semibold">Referrers</h2>
      {[...groups.values()].map(group => <article key={group.referrerId} className="space-y-3 rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="font-semibold">{group.name}</p><p className="break-all font-mono text-xs text-muted-foreground">{group.referrerId}</p><p className="mt-1 text-sm">UPI: {group.upiId ?? "Not provided"}</p></div>
          <div className="grid grid-cols-3 gap-3 text-right text-sm">
            <div><p className="font-semibold">{rupees(group.pending)}</p><p className="text-xs text-muted-foreground">Pending</p></div>
            <div><p className="font-semibold">{rupees(group.approved)}</p><p className="text-xs text-muted-foreground">Approved</p></div>
            <div><p className="font-semibold">{rupees(group.paid)}</p><p className="text-xs text-muted-foreground">Paid</p></div>
          </div>
        </div>
        {group.approved >= minimum && group.upiId ? <AdminPayoutForm userId={group.referrerId}/> : <p className="text-xs text-muted-foreground">{!group.upiId ? "Waiting for UPI details." : "Approved balance must reach " + rupees(minimum) + "."}</p>}
        <details><summary className="cursor-pointer text-sm text-primary">View {group.rows.length} commission records</summary><div className="mt-3 overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-border text-left"><th className="p-2">Payment</th><th className="p-2 text-right">Commission</th><th className="p-2">Eligible date</th><th className="p-2">Status</th></tr></thead><tbody>{group.rows.map(row => <tr key={row.id} className="border-b border-border"><td className="p-2 font-mono">{row.payment_id}</td><td className="p-2 text-right">{rupees(row.commission_amount)}</td><td className="p-2">{new Date(row.eligible_date).toLocaleDateString("en-IN")}</td><td className="p-2 capitalize">{row.status}</td></tr>)}</tbody></table></div></details>
      </article>)}
      {!groups.size ? <p className="rounded-xl border border-border p-8 text-sm text-muted-foreground">No referral commissions have been recorded yet.</p> : null}
    </section>
    <section className="space-y-3"><h2 className="font-heading text-xl font-semibold">Recent payouts</h2>{(payouts ?? []).length ? <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">Referrer</th><th className="p-3 text-right">Amount</th><th className="p-3">UPI reference</th><th className="p-3">Status</th></tr></thead><tbody>{payouts!.map(p => <tr key={p.id} className="border-t border-border"><td className="p-3 font-mono text-xs">{p.user_id}</td><td className="p-3 text-right">{rupees(p.amount)}</td><td className="p-3">{p.transaction_id ?? "—"}</td><td className="p-3 capitalize">{p.status}</td></tr>)}</tbody></table></div> : <p className="rounded-xl border border-border p-6 text-sm text-muted-foreground">No payouts recorded yet.</p>}</section>
  </div>
}

function rupees(paise: number) {
  return "₹" + (Number(paise) / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })
}
function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border p-4"><p className="font-heading text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>
}
