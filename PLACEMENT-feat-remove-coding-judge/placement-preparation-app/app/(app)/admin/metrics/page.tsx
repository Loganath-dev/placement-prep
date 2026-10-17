import { requireAdmin } from "@/lib/admin"
import { PREMIUM_PRICE_INR } from "@/lib/access"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

async function getMetrics() {
  const admin = createAdminClient()
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    signupsToday,
    signupsWeek,
    signupsMonth,
    ctaClicksWeek,
    onboardingsWeek,
    quizAttemptsWeek,
    mockCompletesWeek,
    premiumUpgradesWeek,
    premiumUpgradesMonth,
    totalPremium,
    totalUsers,
    eventCountsWeek,
    recentPayments,
  ] = await Promise.all([
    // Signups today
    admin.auth.admin.listUsers({ page: 1, perPage: 1 }).then(async () => {
      const { count } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStr)
      return count ?? 0
    }),

    // Signups last 7 days
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo)
      .then(({ count }) => count ?? 0),

    // Signups last 30 days
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthAgo)
      .then(({ count }) => count ?? 0),

    // Onboarding completions last 7 days
    admin
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("event", "marketing_cta_click")
      .gte("occurred_at", weekAgo)
      .then(({ count }) => count ?? 0),

    // Onboarding completions last 7 days
    admin
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("event", "onboarding_complete")
      .gte("occurred_at", weekAgo)
      .then(({ count }) => count ?? 0),

    // Quiz attempts last 7 days
    admin
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("event", "quiz_attempt")
      .gte("occurred_at", weekAgo)
      .then(({ count }) => count ?? 0),

    // Mock completions last 7 days
    admin
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("event", "mock_complete")
      .gte("occurred_at", weekAgo)
      .then(({ count }) => count ?? 0),

    // Premium upgrades last 7 days
    admin
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("event", "premium_upgrade")
      .gte("occurred_at", weekAgo)
      .then(({ count }) => count ?? 0),

    // Premium upgrades last 30 days
    admin
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("event", "premium_upgrade")
      .gte("occurred_at", monthAgo)
      .then(({ count }) => count ?? 0),

    // Total premium users
    admin
      .from("user_state")
      .select("id", { count: "exact", head: true })
      .eq("premium", true)
      .then(({ count }) => count ?? 0),

    // Total users
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => count ?? 0),

    // Event counts by type last 7 days
    admin
      .from("analytics_events")
      .select("event")
      .gte("occurred_at", weekAgo)
      .then(({ data }) => {
        const counts: Record<string, number> = {}
        for (const row of data ?? []) {
          counts[row.event] = (counts[row.event] ?? 0) + 1
        }
        return counts
      }),

    // Recent payments
    admin
      .from("payments")
      .select("payment_id, amount, currency, created_at, source")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => data ?? []),
  ])

  const conversionRate =
    signupsMonth > 0 ? ((premiumUpgradesMonth / signupsMonth) * 100).toFixed(1) : "0.0"
  const revenueMonthInr = premiumUpgradesMonth * PREMIUM_PRICE_INR

  return {
    signupsToday,
    signupsWeek,
    signupsMonth,
    ctaClicksWeek,
    onboardingsWeek,
    quizAttemptsWeek,
    mockCompletesWeek,
    premiumUpgradesWeek,
    premiumUpgradesMonth,
    totalPremium,
    totalUsers,
    conversionRate,
    revenueMonthInr,
    eventCountsWeek,
    recentPayments,
  }
}

export default async function AdminMetricsPage() {
  await requireAdmin()
  const m = await getMetrics()

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Admin Metrics</h1>
        <p className="mt-1 text-muted-foreground">
          Live funnel data · service-role · visible only to admins
        </p>
      </div>

      {/* Top KPIs */}
      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold">Overview</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="Total users" value={m.totalUsers} />
          <KpiCard label="Premium users" value={m.totalPremium} />
          <KpiCard label="Conversion (30d)" value={`${m.conversionRate}%`} />
          <KpiCard label="Revenue (30d est.)" value={`₹${m.revenueMonthInr.toLocaleString()}`} />
        </div>
      </section>

      {/* Signups funnel */}
      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold">Signups</h2>
        <div className="grid grid-cols-3 gap-3">
          <KpiCard label="Today" value={m.signupsToday} />
          <KpiCard label="Last 7 days" value={m.signupsWeek} />
          <KpiCard label="Last 30 days" value={m.signupsMonth} />
        </div>
      </section>

      {/* Engagement (7d) */}
      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold">Engagement (last 7 days)</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="CTA clicks" value={m.ctaClicksWeek} />
          <KpiCard label="Onboardings" value={m.onboardingsWeek} />
          <KpiCard label="Quiz attempts" value={m.quizAttemptsWeek} />
          <KpiCard label="Mock completions" value={m.mockCompletesWeek} />
          <KpiCard label="Premium upgrades" value={m.premiumUpgradesWeek} />
        </div>
      </section>

      {/* All events (7d) */}
      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold">All events (last 7 days)</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Event</th>
                <th className="px-4 py-2 text-right font-semibold">Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(m.eventCountsWeek)
                .sort(([, a], [, b]) => b - a)
                .map(([event, count]) => (
                  <tr key={event} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 font-mono text-xs">{event}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{count}</td>
                  </tr>
                ))}
              {Object.keys(m.eventCountsWeek).length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-muted-foreground">
                    No events yet — analytics events will appear here once users interact.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent payments */}
      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold">Recent payments</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Payment ID</th>
                <th className="px-4 py-2 text-left font-semibold">Amount</th>
                <th className="px-4 py-2 text-left font-semibold">Source</th>
                <th className="px-4 py-2 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {m.recentPayments.map((p) => (
                <tr key={p.payment_id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 font-mono text-xs">{p.payment_id}</td>
                  <td className="px-4 py-2 tabular-nums">
                    ₹{((p.amount as number) / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 capitalize text-muted-foreground">{p.source}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {new Date(p.created_at as string).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
              {m.recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                    No payments yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-heading text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
