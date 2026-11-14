"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type AdminReferralRow = {
  id: string
  referrer_id: string | null
  buyer_id: string | null
  payment_id: string
  payment_amount: number
  plan_label: string
  commission_amount: number
  eligible_date: string
  status: string
  created_at: string
  referrer_name: string
  buyer_name?: string
  upi_id: string
  upi_name: string
}

const money = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`

export function AdminReferralsTable({ rows }: { rows: AdminReferralRow[] }) {
  const [references, setReferences] = React.useState<Record<string, string>>({})
  const [paying, setPaying] = React.useState<string | null>(null)
  const [approving, setApproving] = React.useState<string | null>(null)
  const isPayoutDay = Number(new Intl.DateTimeFormat("en-IN", { day: "numeric", timeZone: "Asia/Kolkata" }).format(new Date())) === 25

  async function markPaid(commissionId: string) {
    const transactionId = references[commissionId]?.trim()
    if (!transactionId) {
      toast.error("Enter the UPI transaction reference after transferring the payout.")
      return
    }
    setPaying(commissionId)
    try {
      const response = await fetch("/api/admin/referrals/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionId, transactionId }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? "Could not record payout.")
      toast.success("Payout recorded.")
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not record payout.")
    } finally {
      setPaying(null)
    }
  }

  async function approveReward(commissionId: string) {
    setApproving(commissionId)
    try {
      const response = await fetch("/api/admin/referrals/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionId }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? "Could not approve referral reward.")
      toast.success("Referral reward approved. It is now included in the unpaid balance.")
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not approve referral reward.")
    } finally {
      setApproving(null)
    }
  }

  if (!rows.length) return <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No referral commissions yet.</p>
  return <div className="overflow-x-auto"><table className="w-full min-w-[68rem] text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="py-3 pr-3">Referrer</th><th className="py-3 pr-3">Buyer</th><th className="py-3 pr-3">Plan selected</th><th className="py-3 pr-3">Payment</th><th className="py-3 pr-3">Reward</th><th className="py-3 pr-3">UPI destination</th><th className="py-3 pr-3">Status / review date</th><th className="py-3">Admin action</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b align-top last:border-0"><td className="py-3 pr-3"><span className="block font-medium">{row.referrer_name || (row.referrer_id ? row.referrer_id.slice(0,8) : "Erased account")}</span><span className="text-xs text-muted-foreground">{row.referrer_id?.slice(0,8) ?? "Identity erased"}</span></td><td className="py-3 pr-3"><span className="block font-medium">{row.buyer_name || "Student"}</span><span className="text-xs text-muted-foreground">{row.buyer_id?.slice(0,8) ?? "Identity erased"}</span></td><td className="py-3 pr-3">{row.plan_label}</td><td className="py-3 pr-3">{money(row.payment_amount)}</td><td className="py-3 pr-3 font-semibold">{money(row.commission_amount)}</td><td className="py-3 pr-3"><span className="block font-medium">{row.upi_name || "Name not recorded"}</span><span className="text-xs text-muted-foreground">{row.upi_id || "Missing UPI ID"}</span></td><td className="py-3 pr-3"><span className="block capitalize">{row.status}</span><span className="text-xs text-muted-foreground">Eligible: {new Date(row.eligible_date).toLocaleDateString("en-IN")}</span></td><td className="py-3">{row.status === "pending" ? <div className="min-w-44 space-y-2"><Button size="sm" variant="outline" disabled={approving === row.id || Date.parse(row.eligible_date) > Date.now()} onClick={() => approveReward(row.id)}>{approving === row.id ? "Verifying…" : Date.parse(row.eligible_date) > Date.now() ? "Review period active" : "Verify & approve"}</Button><p className="text-xs text-muted-foreground">Check the captured payment and referral before approval.</p></div> : row.status === "approved" ? <div className="flex min-w-56 gap-2"><Input value={references[row.id] ?? ""} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setReferences((current: Record<string, string>) => ({ ...current, [row.id]: event.target.value }))} placeholder="UPI reference" aria-label="UPI transaction reference" /><Button size="sm" disabled={paying === row.id || !isPayoutDay} onClick={() => markPaid(row.id)}>{paying === row.id ? "Saving…" : isPayoutDay ? "Mark paid" : "Available on 25th"}</Button></div> : <span className="text-xs text-muted-foreground">—</span>}</td></tr>)}</tbody></table></div>
}
