import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type AffiliateAccountAdminRow = {
  user_id: string
  name: string
  referral_code: string
  status: string
  upi_id: string
  upi_name: string
  accepted_at: string
  created_at: string
  terms_current: boolean
  referrals_count: number
  premium_count: number
  premium_purchases_count: number
  pending_commission_paise: number
  approved_unpaid_paise: number
  paid_commission_paise: number
}
export type AffiliateStudentAdminRow = {
  id: string
  name: string
  referred_by: string
  referrer_name: string
  referral_code: string
  joined_at: string | null
  premium: boolean
  premium_until: string | null
  purchase_amount: number | null
  plan_label: string
  payment_status: string
  total_referred_by_referrer: number
}

const money = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`

export function AdminAffiliateDirectory({
  accounts, students, totalCommissions, pendingPaise, approvedPaise, paidPaise,
}: {
  accounts: AffiliateAccountAdminRow[]
  students: AffiliateStudentAdminRow[]
  totalCommissions: number
  pendingPaise: number
  approvedPaise: number
  paidPaise: number
}) {
  return <div className="space-y-6">
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      <Metric label="Affiliate accounts" value={accounts.length} />
      <Metric label="Referred students" value={students.length} />
      <Metric label="Premium conversions" value={students.filter((s) => s.premium).length} />
      <Metric label="Pending rewards" value={money(pendingPaise)} />
      <Metric label="Approved / unpaid" value={money(approvedPaise)} />
      <Metric label="Paid rewards" value={money(paidPaise)} />
    </section>
    <p className="text-xs text-muted-foreground">Commission entries: {totalCommissions} · Paid rewards: {money(paidPaise)} · Minimum payout ₹250 · Payout run: 25th of each month.</p>
    <Card><CardHeader><CardTitle className="text-base">Affiliate accounts and payout details</CardTitle></CardHeader><CardContent>
      {accounts.length ? <div className="overflow-x-auto"><table className="w-full min-w-[64rem] text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">Affiliate</th><th className="py-2 pr-3">Referral code</th><th className="py-2 pr-3">Total referred</th><th className="py-2 pr-3">Verified Premium purchases</th><th className="py-2 pr-3" >Active Premium</th><th className="py-2 pr-3">Pending</th><th className="py-2 pr-3">Amount to pay</th><th className="py-2 pr-3">Paid</th><th className="py-2 pr-3">UPI account</th><th className="py-2 pr-3">Terms</th><th className="py-2">Joined</th></tr></thead><tbody>{accounts.map((a) => <tr key={a.user_id} className="border-b last:border-0"><td className="py-3 pr-3"><strong>{a.name || "Unnamed student"}</strong><span className="block text-xs text-muted-foreground">{a.user_id}</span></td><td className="py-3 pr-3 font-mono text-xs">{a.referral_code}</td><td className="py-3 pr-3 font-semibold">{a.referrals_count}</td><td className="py-3 pr-3">{a.premium_purchases_count}</td><td className="py-3 pr-3">{a.premium_count}</td><td className="py-3 pr-3">{money(a.pending_commission_paise)}</td><td className="py-3 pr-3 font-semibold">{money(a.approved_unpaid_paise)}</td><td className="py-3 pr-3">{money(a.paid_commission_paise)}</td><td className="py-3 pr-3"><strong>{a.upi_name || "Name not provided"}</strong><span className="block text-xs text-muted-foreground">{a.upi_id || "UPI ID not provided"}</span></td><td className="py-3 pr-3">{a.terms_current ? <span className="text-emerald-700 dark:text-emerald-400">Current</span> : <span className="font-semibold text-amber-700 dark:text-amber-400">Reaccept required</span>}</td><td className="py-3">{new Date(a.created_at).toLocaleDateString("en-IN")}</td></tr>)}</tbody></table></div> : <p className="py-6 text-sm text-muted-foreground">No affiliate applications yet.</p>}
    </CardContent></Card>
    <Card><CardHeader><CardTitle className="text-base">Referral attribution and purchase details</CardTitle></CardHeader><CardContent>
      {students.length ? <div className="overflow-x-auto"><table className="w-full min-w-[82rem] text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">Affiliate username</th><th className="py-2 pr-3">Referred student username</th><th className="py-2 pr-3">Total referred by affiliate</th><th className="py-2 pr-3">Signup date</th><th className="py-2 pr-3">Plan selected</th><th className="py-2 pr-3">Payment received</th><th className="py-2 pr-3">Payment status</th><th className="py-2">Premium expiry</th></tr></thead><tbody>{students.map((s) => <tr key={s.id} className="border-b last:border-0"><td className="py-3 pr-3"><strong>{s.referrer_name}</strong><span className="block text-xs text-muted-foreground">{s.referral_code}</span></td><td className="py-3 pr-3"><strong>{s.name}</strong><span className="block text-xs text-muted-foreground">{s.id.slice(0, 8)}</span></td><td className="py-3 pr-3 font-semibold">{s.total_referred_by_referrer}</td><td className="py-3 pr-3">{s.joined_at ? new Date(s.joined_at).toLocaleDateString("en-IN") : "—"}</td><td className="py-3 pr-3">{s.plan_label}</td><td className="py-3 pr-3">{s.purchase_amount !== null ? money(s.purchase_amount) : "—"}</td><td className="py-3 pr-3">{s.payment_status}</td><td className="py-3">{s.premium_until ? new Date(s.premium_until).toLocaleDateString("en-IN") : "—"}</td></tr>)}</tbody></table></div> : <div className="space-y-2 py-6 text-sm text-muted-foreground"><p>No referred students yet.</p><p>New referrals will appear here after someone signs up using an affiliate link.</p></div>}
    </CardContent></Card>
  </div>
}
function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl border border-border bg-card p-4"><p className="font-heading text-xl font-bold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>
}
