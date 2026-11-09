import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function ReferralsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [{ data: summary }, { data: commissions }, { data: payouts }, { data: profile }] = await Promise.all([
    supabase.rpc("get_affiliate_summary"),
    supabase.from("affiliate_commissions").select("payment_id,payment_amount,commission_amount,eligible_date,status,created_at").eq("referrer_id", user.id).order("created_at", { ascending: false }).limit(100),
    supabase.from("affiliate_payouts").select("id,amount,upi_id,transaction_id,status,paid_at,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("profiles").select("upi_id,upi_name").eq("id", user.id).maybeSingle(),
  ])
  const totals = Array.isArray(summary) ? summary[0] : null
  const referralUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://studybench.in") + "/invite?ref=" + user.id

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Refer and earn</h1>
        <p className="mt-1 text-muted-foreground">Earn a fixed ₹50 when a referred student completes an eligible ₹249 annual purchase.</p>
      </div>
      <section className="rounded-xl border border-border bg-card p-5">
        <p className="font-semibold">Your referral link</p>
        <p className="mt-1 break-all text-sm text-muted-foreground">{referralUrl}</p>
        <p className="mt-2 text-xs text-muted-foreground">Your referral ID is linked to your account. Self-referrals are not eligible.</p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Signups" value={Number(totals?.total_signups ?? 0)} />
        <Metric label="Paid referrals" value={Number(totals?.premium_referrals ?? 0)} />
        <Metric label="Unpaid commission" value={rupees(totals?.pending_commission)} />
        <Metric label="Paid commission" value={rupees(totals?.paid_commission)} />
      </section>
      <section className="rounded-xl border border-border p-5">
        <h2 className="font-heading text-lg font-semibold">UPI payout details</h2>
        <p className="mt-1 text-sm text-muted-foreground">Payouts are manual. The approved balance must reach ₹250.</p>
        <form action="/api/referrals/payout-details" method="post" className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="upi_name" defaultValue={profile?.upi_name ?? ""} placeholder="Account holder name" maxLength={100} className="h-10 rounded-md border border-input bg-background px-3 text-sm" />
          <input name="upi_id" defaultValue={profile?.upi_id ?? ""} placeholder="name@bank" maxLength={100} className="h-10 rounded-md border border-input bg-background px-3 text-sm" />
          <button type="submit" className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground sm:col-span-2">Save UPI details</button>
        </form>
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Commission history</h2>
        {(commissions ?? []).length ? (
          <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className="p-3 text-left">Purchase</th><th className="p-3 text-right">Commission</th><th className="p-3 text-left">Eligible</th><th className="p-3 text-left">Status</th></tr></thead>
            <tbody>{commissions!.map(row => <tr key={row.payment_id} className="border-t border-border"><td className="p-3 font-mono text-xs">{row.payment_id}</td><td className="p-3 text-right">{rupees(row.commission_amount)}</td><td className="p-3">{new Date(row.eligible_date).toLocaleDateString("en-IN")}</td><td className="p-3 capitalize">{row.status}</td></tr>)}</tbody>
          </table></div>
        ) : <p className="rounded-xl border border-border p-6 text-sm text-muted-foreground">No referred purchases yet.</p>}
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Payout history</h2>
        {(payouts ?? []).length ? (
          <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-right">Amount</th><th className="p-3 text-left">UPI</th><th className="p-3 text-left">Status</th></tr></thead>
            <tbody>{payouts!.map(row => <tr key={row.id} className="border-t border-border"><td className="p-3">{new Date(row.created_at).toLocaleDateString("en-IN")}</td><td className="p-3 text-right">{rupees(row.amount)}</td><td className="p-3">{row.upi_id}</td><td className="p-3 capitalize">{row.status}</td></tr>)}</tbody>
          </table></div>
        ) : <p className="rounded-xl border border-border p-6 text-sm text-muted-foreground">No payouts recorded yet.</p>}
      </section>
    </div>
  )
}

function rupees(paise: unknown) {
  return "₹" + (Number(paise ?? 0) / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })
}
function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl border border-border p-4"><p className="font-heading text-2xl font-bold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>
}
