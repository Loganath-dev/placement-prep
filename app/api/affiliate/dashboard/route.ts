import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { rateLimit } from "@/lib/rate-limit"

type AffiliateCommissionRow = {
  id: string
  buyer_id: string | null
  payment_amount: number
  commission_amount: number
  plan_key: string | null
  status: string
  eligible_date: string
  created_at: string
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  const { allowed } = await rateLimit(`affiliate-dashboard:${user.id}`, 60, 60 * 60 * 1000)
  if (!allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 })

  const admin = createAdminClient()
  const [accountRes, commissionsRes, referralsRes, payoutsRes] = await Promise.all([
    admin
      .from("affiliate_accounts")
      .select("referral_code,status,terms_version,privacy_version,accepted_at,created_at,upi_id,upi_name")
      .eq("user_id", user.id)
      .maybeSingle(),
    // buyer_id is used only for an aggregate conversion count on the server.
    // It and payment_id/payment amount are never returned to the referrer.
    admin
      .from("affiliate_commissions")
      .select("id,buyer_id,payment_amount,commission_amount,plan_key,status,eligible_date,created_at")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false }),
    admin
      .from("profiles")
      .select("id,name,created_at")
      .eq("referred_by", user.id)
      .order("created_at", { ascending: false }),
    admin
      .from("affiliate_payouts")
      .select("id,amount,upi_id,upi_name,transaction_id,status,paid_at,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ])

  if (accountRes.error) return NextResponse.json({ error: "Could not load affiliate account." }, { status: 500 })
  if (commissionsRes.error || referralsRes.error || payoutsRes.error) {
    return NextResponse.json({ error: "Could not load affiliate activity." }, { status: 500 })
  }

  const commissionRows = (commissionsRes.data ?? []) as AffiliateCommissionRow[]
  const referredProfiles = (referralsRes.data ?? []) as { id: string; name: string | null; created_at: string | null }[]
  const referredIds = referredProfiles.map((row) => row.id)
  const paymentsRes = referredIds.length
    ? await admin.from("payments")
        .select("user_id,amount,plan_key,created_at")
        .in("user_id", referredIds)
        .order("created_at", { ascending: false })
    : { data: [], error: null }
  if (paymentsRes.error) return NextResponse.json({ error: "Could not reconcile referred student purchases." }, { status: 500 })
  const paymentByUser = new Map<string, { amount: number; plan_key: string | null; created_at: string }>()
  for (const payment of (paymentsRes.data ?? []) as { user_id: string; amount: number; plan_key: string | null; created_at: string }[]) {
    if (!paymentByUser.has(payment.user_id)) paymentByUser.set(payment.user_id, payment)
  }
  const commissionByBuyer = new Map<string, AffiliateCommissionRow>()
  for (const row of commissionRows) {
    if (row.buyer_id && !commissionByBuyer.has(row.buyer_id) && ["pending", "approved", "paid"].includes(row.status)) {
      commissionByBuyer.set(row.buyer_id, row)
    }
  }
  const premiumConversions = referredProfiles.filter((profile) => paymentByUser.has(profile.id) || commissionByBuyer.has(profile.id)).length
  const commissions = commissionRows.map((row) => ({
    id: row.id,
    planLabel: row.plan_key === "premium_annual_249" || row.payment_amount === 24900
      ? "Legacy 1-year Premium (₹249)"
      : row.plan_key === "premium_6_months_299" || row.payment_amount === 29900
        ? "6-month Premium (₹299)"
        : row.plan_key === "premium_annual_499" || row.payment_amount === 49900
          ? "1-year Premium (₹499)"
          : "Premium purchase",
    commission_amount: row.commission_amount,
    status: row.status,
    eligible_date: row.eligible_date,
    created_at: row.created_at,
  }))

  return NextResponse.json(
    {
      account: accountRes.data,
      referralsCount: referredProfiles.length,
      referrals: referredProfiles.map((row) => {
        const payment = paymentByUser.get(row.id)
        const commission = commissionByBuyer.get(row.id)
        return {
          // Only the authenticated affiliate's attributed referrals are included.
          // Do not expose student IDs, email addresses, payment IDs or UPI details.
          studentName: row.name?.trim() || "StudyBench student",
          joinedAt: row.created_at,
          planLabel: getPlanLabel(commission?.plan_key ?? payment?.plan_key ?? null, commission?.payment_amount ?? payment?.amount ?? null),
          paymentStatus: payment ? "Premium payment captured" : "No Premium purchase yet",
          purchasedAt: payment?.created_at ?? commission?.created_at ?? null,
        }
      }),
      premiumConversions,
      commissions,
      payouts: payoutsRes.data ?? [],
    },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  )
}

function getPlanLabel(planKey: string | null, amountPaise: number | null): string {
  if (planKey === "premium_6_months_299" || amountPaise === 29900) return "6-month Premium (₹299)"
  if (planKey === "premium_annual_499" || amountPaise === 49900) return "1-year Premium (₹499)"
  if (planKey === "premium_annual_249" || amountPaise === 24900) return "Legacy 1-year Premium (₹249)"
  if (planKey === "premium_lifetime_249") return "Legacy lifetime Premium"
  return "No Premium purchase"
}
