import type { Metadata } from "next"
import Link from "next/link"
import { JsonLd } from "@/app/json-ld"
import { Button } from "@/components/ui/button"
import { SITE_NAME, SITE_URL } from "@/lib/content/blocks"

export const metadata: Metadata = {
  title: "Student Affiliate Programme: Earn ₹25 or ₹50 per Sale",
  description:
    "Refer students to StudyBench and earn a fixed ₹25 or ₹50 reward for eligible Premium purchases. See how referrals, review periods and UPI payouts work.",
  alternates: { canonical: `${SITE_URL}/affiliate-program` },
  openGraph: {
    title: `StudyBench Student Affiliate Programme | ${SITE_NAME}`,
    description:
      "Earn a fixed reward for eligible StudyBench Premium referrals. Review reward rates, eligibility and payout terms before you join.",
    type: "website",
    url: `${SITE_URL}/affiliate-program`,
  },
}

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Affiliate programme", item: `${SITE_URL}/affiliate-program` },
  ],
}

export default function AffiliateProgramPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <JsonLd data={breadcrumb} />

      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">StudyBench student affiliate programme</p>
        <h1 className="mt-4 font-heading text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          Share a useful study resource. Earn a fixed referral reward.
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          Help a friend prepare for campus placements with StudyBench. When an eligible student you refer completes a verified Premium purchase, you can earn a fixed reward.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild><Link href="/auth/signup">Create a free account</Link></Button>
          <Button asChild variant="outline"><Link href="/referrals">Sign in to apply</Link></Button>
        </div>
      </header>

      <section className="mt-12 border-y border-border py-7" aria-labelledby="reward-rates">
        <h2 id="reward-rates" className="font-heading text-xl font-semibold">Reward per verified Premium purchase</h2>
        <div className="mt-5 divide-y divide-border">
          <div className="flex items-center justify-between gap-4 py-4">
            <p><span className="block font-medium">6-month Premium</span><span className="text-sm text-muted-foreground">Student plan price: ₹299</span></p>
            <p className="text-2xl font-semibold tabular-nums">₹25</p>
          </div>
          <div className="flex items-center justify-between gap-4 py-4">
            <p><span className="block font-medium">1-year Premium</span><span className="text-sm text-muted-foreground">Student plan price: ₹499</span></p>
            <p className="text-2xl font-semibold tabular-nums">₹50</p>
          </div>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">These are fixed programme rewards, not a promise of income. Rewards are recorded only for eligible, verified purchases.</p>
      </section>

      <section className="mt-10" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="font-heading text-2xl font-semibold">How the referral programme works</h2>
        <ol className="mt-5 space-y-4 text-base leading-7 text-muted-foreground">
          <li><strong className="text-foreground">1. Apply after signing in with a verified email.</strong> Accept the affiliate terms and privacy notice, and provide your UPI payout details.</li>
          <li><strong className="text-foreground">2. Share your personal referral link.</strong> Your link is available in the Refer &amp; Earn dashboard after your account is activated.</li>
          <li><strong className="text-foreground">3. A referred student purchases Premium.</strong> The purchase must be verified and remain eligible after the review period.</li>
          <li><strong className="text-foreground">4. Track rewards and payouts.</strong> Approved rewards become payable when your approved balance reaches ₹250.</li>
        </ol>
      </section>

      <section className="mt-10 rounded-2xl bg-muted/50 p-6 sm:p-7" aria-labelledby="payout-rules">
        <h2 id="payout-rules" className="font-heading text-xl font-semibold">Eligibility and payout timing</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
          <li>A 15-day review period applies to referral purchases.</li>
          <li>Self-referrals, duplicate or fraudulent accounts, and invalid, cancelled or reversed purchases are excluded.</li>
          <li>Eligible approved balances of at least ₹250 are paid manually by UPI on the 25th of the month. If the review period or threshold is not met, the balance carries forward.</li>
          <li>Referral rewards do not guarantee earnings, employment, placement or selection by any company.</li>
        </ul>
        <p className="mt-5 text-sm text-muted-foreground">Read the full <Link className="font-medium text-primary underline underline-offset-4" href="/terms#affiliate-programme">affiliate programme terms</Link> and <Link className="font-medium text-primary underline underline-offset-4" href="/privacy">Privacy Policy</Link>.</p>
      </section>

      <section className="mt-10 border-t border-border pt-8" aria-labelledby="affiliate-faq">
        <h2 id="affiliate-faq" className="font-heading text-2xl font-semibold">Affiliate programme questions</h2>
        <div className="mt-5 space-y-6">
          <div><h3 className="font-semibold">How much can a StudyBench affiliate earn per referral?</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">The fixed reward is ₹25 for an eligible verified ₹299 six-month Premium purchase and ₹50 for an eligible verified ₹499 one-year Premium purchase.</p></div>
          <div><h3 className="font-semibold">When are affiliate rewards paid?</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Approved rewards are paid manually by UPI on the 25th of the month once the approved balance reaches ₹250 and the 15-day review period is complete.</p></div>
          <div><h3 className="font-semibold">How do I get my referral link?</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Sign in, open Refer &amp; Earn, and apply by accepting the programme terms and providing your UPI details. Your personal link appears after activation.</p></div>
        </div>
      </section>

      <p className="mt-10 text-sm text-muted-foreground">StudyBench is an independent placement preparation platform. Referral participation does not imply endorsement by employers or guarantee a placement outcome.</p>
    </main>
  )
}
