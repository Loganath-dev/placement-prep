"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/app/page-header"
import { Icon } from "@/components/app-icon"
import { useStore } from "@/lib/store"
import { PREMIUM_ANNUAL_PRICE_INR, PREMIUM_SIX_MONTH_PRICE_INR } from "@/lib/access"
import { AFFILIATE_TERMS_VERSION, AFFILIATE_PRIVACY_VERSION } from "@/lib/affiliate-terms"

type AffiliateData = {
  account: null | {
    referral_code: string
    status: string
    accepted_at: string
    created_at: string
    upi_id: string
    upi_name: string
    terms_version: string
    privacy_version: string
  }
  referralsCount: number
  referrals: { studentName: string; joinedAt: string | null; planLabel: string; paymentStatus: string; purchasedAt: string | null }[]
  premiumConversions: number
  commissions: { id: string; planLabel: string; commission_amount: number; status: string; created_at: string; eligible_date: string }[]
  payouts: { id: string; amount: number; upi_id: string; upi_name: string | null; transaction_id: string | null; status: string; paid_at: string | null; created_at: string }[]
}
const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`

async function readApiResponse(response: Response): Promise<Record<string, any>> {
  const body = await response.text()
  if (body) {
    try {
      return JSON.parse(body) as Record<string, any>
    } catch {
      // Use a useful HTTP error below instead of exposing a JSON parser error.
    }
  }

  if (!response.ok) throw new Error(`The request failed (${response.status}). Please try again.`)
  throw new Error("The server returned an empty response. Please try again.")
}

export default function ReferralsPage() {
  const { userId } = useStore()
  const [data, setData] = React.useState<AffiliateData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [termsAccepted, setTermsAccepted] = React.useState(false)
  const [privacyAccepted, setPrivacyAccepted] = React.useState(false)
  const [updatedTermsAccepted, setUpdatedTermsAccepted] = React.useState(false)
  const [updatedPrivacyAccepted, setUpdatedPrivacyAccepted] = React.useState(false)
  const [editingPayoutDetails, setEditingPayoutDetails] = React.useState(false)
  const [upiId, setUpiId] = React.useState("")
  const [upiName, setUpiName] = React.useState("")

  const load = React.useCallback(async () => {
    try {
      const response = await fetch("/api/affiliate/dashboard", { cache: "no-store" })
      const result = await readApiResponse(response)
      if (!response.ok) throw new Error(result.error ?? "Could not load affiliate account.")
      setData(result as AffiliateData)
      if (result.account) {
        setUpiId(result.account.upi_id)
        setUpiName(result.account.upi_name)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load affiliate account.")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const task = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(task)
  }, [load, userId])

  async function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!termsAccepted || !privacyAccepted || saving) return
    setSaving(true)
    try {
      const response = await fetch("/api/affiliate/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termsAccepted, privacyAccepted, upiId, upiName }),
      })
      const result = await readApiResponse(response)
      if (!response.ok) throw new Error(result.error ?? "Could not activate affiliate account.")
      toast.success("Affiliate account activated. Your referral link is ready.")
      window.dispatchEvent(new Event("affiliate-account-updated"))
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit application.")
    } finally {
      setSaving(false)
    }
  }

  const account = data?.account
  const consentCurrent = Boolean(
    account &&
    account.terms_version === AFFILIATE_TERMS_VERSION &&
    account.privacy_version === AFFILIATE_PRIVACY_VERSION
  )
  const referralUrl = account && typeof window !== "undefined" ? `${window.location.origin}/auth/signup?ref=${account.referral_code}` : ""

  async function acceptUpdatedTerms() {
    if (!updatedTermsAccepted || !updatedPrivacyAccepted || saving) return
    setSaving(true)
    try {
      const response = await fetch("/api/affiliate/terms/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termsAccepted: updatedTermsAccepted, privacyAccepted: updatedPrivacyAccepted }),
      })
      const result = await readApiResponse(response)
      if (!response.ok) throw new Error(result.error ?? "Could not update affiliate consent.")
      toast.success("Updated affiliate terms accepted.")
      setUpdatedTermsAccepted(false)
      setUpdatedPrivacyAccepted(false)
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update affiliate consent.")
    } finally {
      setSaving(false)
    }
  }

  async function savePayoutDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      const response = await fetch("/api/affiliate/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upiId, upiName }),
      })
      const result = await readApiResponse(response)
      if (!response.ok) throw new Error(result.error ?? "Could not update payout details.")
      setData((current) => current?.account ? { ...current, account: { ...current.account, ...result.account } } : current)
      setEditingPayoutDetails(false)
      toast.success("Payout details updated.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update payout details.")
    } finally {
      setSaving(false)
    }
  }
  const commissions = data?.commissions ?? []
  const referralsCount = data?.referralsCount ?? 0
  const payouts = data?.payouts ?? []
  const eligible = commissions.filter((row) => row.status === "approved").reduce((sum, row) => sum + row.commission_amount, 0)
  const pending = commissions.filter((row) => row.status === "pending").reduce((sum, row) => sum + row.commission_amount, 0)
  const paid = payouts.filter((row) => row.status === "paid").reduce((sum, row) => sum + row.amount, 0)
  const totalEarned = commissions.filter((row) => row.status !== "cancelled").reduce((sum, row) => sum + row.commission_amount, 0)

  async function copyLink() {
    if (!referralUrl) return
    await navigator.clipboard.writeText(referralUrl)
    toast.success("Referral link copied")
  }

  if (loading) return <div className="space-y-4"><PageHeader eyebrow="Affiliate programme" title="Refer students. Earn rewards." /><div className="rounded-xl border p-8 text-sm text-muted-foreground">Loading your affiliate account…</div></div>

  if (!account) return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader eyebrow="StudyBench affiliate programme" title="Help a friend prepare. Earn when they go Premium." description="Apply once to activate your personal referral link and track every eligible Premium purchase." />
      <section className="max-w-md">
        <Card><CardContent className="space-y-3 p-5"><p className="text-sm font-semibold">Earn for each verified Premium purchase</p><div className="flex items-center justify-between gap-3 text-sm"><span className="text-muted-foreground">6 months · ₹{PREMIUM_SIX_MONTH_PRICE_INR}</span><strong className="text-lg">₹25</strong></div><div className="flex items-center justify-between gap-3 text-sm"><span className="text-muted-foreground">1 year · ₹{PREMIUM_ANNUAL_PRICE_INR}</span><strong className="text-lg">₹50</strong></div></CardContent></Card>
      </section>
      <Card>
        <CardHeader><CardTitle className="text-base">Before you join</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Rewards are created only after a referred student completes a verified Premium payment.</li>
            <li>Self-referrals, duplicate accounts, fraudulent signups and invalid or reversed transactions are not eligible.</li>
            <li>Approved rewards are paid manually by UPI on the 25th of the month, once your available balance reaches ₹250.</li>
            <li>Referral activity and payout status are visible in your affiliate dashboard.</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Affiliate application</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={apply} className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium">UPI ID<Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@bank" required /></label>
              <label className="space-y-1.5 text-sm font-medium">UPI account-holder name<Input value={upiName} onChange={(e) => setUpiName(e.target.value)} placeholder="Name on your UPI account" required /></label>
            </div>
            <div className="space-y-3 rounded-xl border bg-muted/30 p-4 text-sm">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 size-4 accent-primary" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} required />
                <span>I have read and agree to the <Link className="font-semibold text-primary underline" href="/terms" target="_blank">Terms & Conditions</Link>, including the affiliate programme rules, reward eligibility, fraud prevention and payout schedule.</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 size-4 accent-primary" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} required />
                <span>I have read the <Link className="font-semibold text-primary underline" href="/privacy" target="_blank">Privacy Policy</Link> and consent to processing my referral and UPI payout details for this programme.</span>
              </label>
            </div>
            <Button type="submit" disabled={saving || !termsAccepted || !privacyAccepted}>{saving ? "Activating…" : "Accept & join affiliate programme"} <Icon name="ArrowRight" className="ml-2 size-4" /></Button>
            <p className="text-xs text-muted-foreground">Your unique referral link is generated only after both checkboxes are accepted and your UPI details are saved.</p>
          </form>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="StudyBench affiliate programme" title="Your referral dashboard" description="Share your unique link, see the students who joined through it and track your UPI rewards." />
      {!consentCurrent && (
        <Card className="border-amber-500/40">
          <CardHeader><CardTitle className="text-base">Updated affiliate terms require your acceptance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">The current programme pays ₹25 for a verified ₹299 six-month purchase or ₹50 for a verified ₹499 annual purchase. Your previous consent predates this update. Payout settlement is paused until you accept both updated documents.</p>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-1 size-4 accent-primary" checked={updatedTermsAccepted} onChange={(event) => setUpdatedTermsAccepted(event.target.checked)} />
              <span>I have read and agree to the updated <Link className="font-semibold text-primary underline" href="/terms" target="_blank">Terms & Conditions</Link>.</span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-1 size-4 accent-primary" checked={updatedPrivacyAccepted} onChange={(event) => setUpdatedPrivacyAccepted(event.target.checked)} />
              <span>I have read the <Link className="font-semibold text-primary underline" href="/privacy" target="_blank">Privacy Policy</Link>.</span>
            </label>
            <Button onClick={() => void acceptUpdatedTerms()} disabled={saving || !updatedTermsAccepted || !updatedPrivacyAccepted}>
              {saving ? "Saving consent…" : "Accept updated terms"}
            </Button>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Icon name="Link2" className="size-4 text-primary" /> Your unique referral link</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row"><Input value={referralUrl} readOnly aria-label="Your referral link" /><Button onClick={copyLink}><Icon name="Copy" className="mr-2 size-4" />Copy link</Button></div>
          <p className="text-xs text-muted-foreground">Referral code: <strong>{account.referral_code}</strong> · Active since {new Date(account.created_at).toLocaleDateString("en-IN")}</p>
        </CardContent>
      </Card>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard label="Students referred" value={String(referralsCount)} />
        <SummaryCard label="Premium conversions" value={String(data?.premiumConversions ?? 0)} />
        <SummaryCard label="Total rewards" value={rupees(totalEarned)} />
        <SummaryCard label="Awaiting approval" value={rupees(pending)} />
        <SummaryCard label="Available for payout" value={rupees(eligible)} />
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">Reward rules</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>6 months (₹{PREMIUM_SIX_MONTH_PRICE_INR}): <strong>₹25</strong></p><p>1 year (₹{PREMIUM_ANNUAL_PRICE_INR}): <strong>₹50</strong></p><p>Minimum payout: <strong>₹250</strong></p><p>Payout date: <strong>25th of every month</strong></p><p className="text-xs text-muted-foreground">Approved rewards are paid manually to {account.upi_id}. A 15-day review window applies for transaction verification and fraud prevention.</p></CardContent></Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0"><CardTitle className="text-base">Payout summary</CardTitle>{!editingPayoutDetails ? <Button type="button" variant="outline" size="sm" onClick={() => setEditingPayoutDetails(true)}>Edit details</Button> : null}</CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>Already paid: <strong>{rupees(paid)}</strong></p>
            {editingPayoutDetails ? (
              <form onSubmit={savePayoutDetails} className="space-y-3 rounded-lg border p-3">
                <label className="block space-y-1.5 font-medium">UPI ID<Input value={upiId} onChange={(event) => setUpiId(event.target.value)} required /></label>
                <label className="block space-y-1.5 font-medium">UPI account-holder name<Input value={upiName} onChange={(event) => setUpiName(event.target.value)} required /></label>
                <div className="flex gap-2"><Button type="submit" size="sm" disabled={saving}>{saving ? "Saving…" : "Save details"}</Button><Button type="button" size="sm" variant="ghost" onClick={() => { setUpiId(account.upi_id); setUpiName(account.upi_name); setEditingPayoutDetails(false) }}>Cancel</Button></div>
              </form>
            ) : <p>UPI account: <strong>{account.upi_name}</strong> · {account.upi_id}</p>}
            <p>Next payout run: <strong>25th</strong> (if your approved balance is at least ₹250).</p>
            {payouts.length ? <div className="border-t pt-2">{payouts.map((row) => <p key={row.id} className="py-1 text-xs text-muted-foreground">{new Date(row.paid_at ?? row.created_at).toLocaleDateString("en-IN")} · {rupees(row.amount)} · {row.status} · {row.upi_name || "Name not recorded"} ({row.upi_id}) {row.transaction_id ? `· ${row.transaction_id}` : ""}</p>)}</div> : null}
          </CardContent>
        </Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Students who joined through your link</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm text-muted-foreground">Only students whose signup was attributed to your referral link are listed. Private IDs, email addresses and payment references are never shown.</p>{(data?.referrals ?? []).length ? <div className="overflow-x-auto"><table className="w-full min-w-[42rem] text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">Student</th><th className="py-2 pr-3">Joined on</th><th className="py-2 pr-3">Plan selected</th><th className="py-2">Payment</th></tr></thead><tbody>{data!.referrals.map((row, index) => <tr key={`${row.studentName}-${row.joinedAt ?? index}`} className="border-b last:border-0"><td className="py-3 pr-3 font-medium">{row.studentName}</td><td className="py-3 pr-3">{row.joinedAt ? new Date(row.joinedAt).toLocaleDateString("en-IN") : "Date unavailable"}</td><td className="py-3 pr-3">{row.planLabel}</td><td className="py-3">{row.paymentStatus}</td></tr>)}</tbody></table></div> : <p className="py-6 text-sm text-muted-foreground">No students have joined through your link yet. Share it to get started.</p>}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Commission activity</CardTitle></CardHeader><CardContent>{commissions.length ? <div className="overflow-x-auto"><table className="w-full min-w-[32rem] text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">Purchase plan</th><th className="py-2 pr-3">Reward</th><th className="py-2 pr-3">Date</th><th className="py-2">Status</th></tr></thead><tbody>{commissions.map((row) => <tr key={row.id} className="border-b last:border-0"><td className="py-3 pr-3">{row.planLabel}</td><td className="py-3 pr-3 font-semibold">{rupees(row.commission_amount)}</td><td className="py-3 pr-3">{new Date(row.created_at).toLocaleDateString("en-IN")}</td><td className="py-3 capitalize">{row.status}</td></tr>)}</tbody></table></div> : <p className="py-6 text-sm text-muted-foreground">No Premium commissions yet.</p>}</CardContent></Card>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return <Card><CardContent className="p-4"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 font-heading text-2xl font-bold tabular-nums">{value}</p></CardContent></Card>
}
