

import Link from "next/link"
import { SiteHeader, StartCta, ShareScoreCta, TrackedLink } from "./landing-client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/app/icon"
import { CompanyAvatar } from "@/components/app/ui-bits"
import { PriRing } from "@/components/app/pri-ring"
import {
  PLAN_FEATURES,
  PREMIUM_FOOD_COMPARISON_LABEL,
  PREMIUM_MONTHLY_EQUIVALENT_INR,
  premiumPriceLabel,
} from "@/lib/access"
import { track } from "@/lib/analytics"
import { FAQS } from "@/lib/content/faq"
import { SITE_URL } from "@/lib/content/blocks"
import { getCompany, SELECTABLE_COMPANIES } from "@/lib/data/companies"
import type { CompanyId } from "@/lib/types"

const NAV_LINKS = [
  { href: "/prep", label: "Company guides" },
  { href: "/blog", label: "Blog" },
  { href: "#pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
]

const PREVIEW: { id: CompanyId; pri: number; prob: number }[] = [
  { id: "tcs", pri: 85, prob: 78 },
  { id: "infosys", pri: 70, prob: 58 },
  { id: "wipro", pri: 64, prob: 51 },
  { id: "zoho", pri: 38, prob: 19 },
]

const HERO_POINTS = [
  "All of Section 1 unlocked in every company track",
  "Company-wise PYQs, mocks, coding and interview prep",
  "Start free with no card. Upgrade only when you want deeper practice",
]

const PROOF_POINTS = [
  { label: "Tracks", value: "13 company + core tracks" },
  { label: "Free access", value: "No card needed" },
  { label: "Premium", value: premiumPriceLabel() },
  { label: "Mock tests", value: "Company-pattern simulations" },
]

const METHOD_PRINCIPLES = [
  {
    icon: "Target",
    title: "Diagnose before you grind",
    body: "A first mock quickly tells you whether the real gap is speed, accuracy, aptitude, coding or interview confidence.",
  },
  {
    icon: "TrendingUp",
    title: "Readiness stays honest",
    body: "Readiness increases only when you actually pass chapters and improve mock performance. Skipping content does not inflate the score.",
  },
  {
    icon: "RefreshCw",
    title: "Weak areas come back",
    body: "Mistakes are scheduled for review so the same weak question does not disappear after one attempt and then return in the real test.",
  },
]

const TESTIMONIALS = [
  {
    name: "Aditya Vardhan",
    role: "Placed at TCS (Digital)",
    avatar: "AV",
    content: "Honestly, I was really struggling with advanced coding. StudyBench's TCS track showed me exactly the style of questions they ask. The compiler and compiler edge cases were spot on, and I went from struggling with basic syntax to cracking the Digital offer.",
  },
  {
    name: "Sneha Rao",
    role: "Placed at Accenture",
    avatar: "SR",
    content: "Aptitude rounds were my nightmare. I was preparing randomly until I used the Readiness Index here. It gave me a clear picture of my weak areas in Quant and Reasoning. The practice chapters helped me clear the Accenture cutoff without panicking.",
  },
  {
    name: "Rohit Deshmukh",
    role: "Placed at Zoho (Software Developer)",
    avatar: "RD",
    content: "Zoho is notorious for their conceptual rounds. The Zoho track's conceptual PYQs and the coding ladder matched the pattern perfectly. Doing the machine round simulations on StudyBench gave me the confidence to nail the actual offline round.",
  },
  {
    name: "Ananya Iyer",
    role: "Placed at Cognizant (GenC Elevate)",
    avatar: "AI",
    content: "I had a decent technical score but always got nervous during HR and managerial rounds. The mock interview scenarios and communication prompts on StudyBench were super helpful. Having everything on one dashboard really saved my time.",
  },
  {
    name: "Kunal Sen",
    role: "Placed at Infosys (System Engineer)",
    avatar: "KS",
    content: "We had a sudden Infosys drive on our campus. With just two weeks to prepare, the Infosys-pattern mock tests were a lifesaver. I managed to optimize my sectional speeds and cleared the test easily.",
  },
  {
    name: "Priya Nair",
    role: "Placed at Wipro",
    avatar: "PN",
    content: "Most platforms give you a fake 100% readiness guarantee. StudyBench was honest—it started me at 45% readiness. Solving my mistake notebook daily and seeing that score climb to 85% was the main reason I cleared my Wipro round.",
  },
]

export function LandingPage() {
  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <Hero />
      <WhyJoinSection />
      <ProofStrip />
      <ProblemSection />
      <FeatureBento />
      <MethodSection />
      <PrepJourneysSection />
      <PricingSection />
      <HomeFaqSection />
      <ShareScoreCta />
      <FinalCta />
      <SiteFooter />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.95_0.04_90/.75),transparent_42%),radial-gradient(circle_at_bottom_right,oklch(0.93_0.03_220/.45),transparent_40%)]"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:grid-cols-[1.1fr_.9fr] md:px-6 md:py-24">
        <div className="relative animate-in duration-700 fade-in slide-in-from-bottom-4 motion-reduce:animate-none">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            <Icon name="BookOpen" className="size-3.5" />
            Campus placement prep for Indian freshers
          </span>
          <h1 className="mt-5 max-w-3xl text-balance font-heading text-4xl leading-[1.03] font-extrabold tracking-[-0.04em] md:text-5xl lg:text-6xl">
            Crack campus placements with a company-wise plan.
            <span className="block text-primary">
              Study, practise, mock, and know your readiness.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            StudyBench gives Indian freshers one focused route for aptitude,
            coding, CS core, mock tests, interview prep and a clear Placement Readiness Index.
          </p>

          <div className="mt-6 grid gap-2 sm:max-w-xl">
            {HERO_POINTS.map((point) => (
              <p key={point} className="flex items-center gap-2 text-sm text-foreground/85">
                <span className="grid size-5 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon name="Check" className="size-3.5" />
                </span>
                {point}
              </p>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <StartCta placement="hero_primary" size="lg">
              Start free
            </StartCta>
            <Button asChild size="lg" variant="outline">
              <TrackedLink href="#pricing" placement="hero_pricing">
                See ₹249 plan
              </TrackedLink>
            </Button>
          </div>
        </div>

        <div className="relative animate-in duration-700 [animation-delay:120ms] fade-in slide-in-from-bottom-6 motion-reduce:animate-none">
          <div className="rounded-2xl border border-border bg-card/95 p-6 shadow-[0_30px_80px_-50px_oklch(0.2_0.03_90/_0.35)]">
            <div className="flex items-center gap-5">
              <PriRing value={72} size={108} label="Overall" tone="success" />
              <div>
                <p className="font-heading text-lg font-semibold">Your readiness view</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  One score across every company you are targeting.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {PREVIEW.map((row) => {
                const company = SELECTABLE_COMPANIES.find((item) => item.id === row.id)!
                return (
                  <div key={row.id} className="flex items-center gap-3">
                    <CompanyAvatar id={row.id} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{company.short}</span>
                        <span className="tabular-nums text-muted-foreground">
                          PRI {row.pri} · ~{row.prob}%
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-sm bg-muted">
                        <div
                          className="h-full rounded-sm bg-primary"
                          style={{ width: `${row.pri}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

function WhyJoinSection() {
  const reasons = [
    "Because random preparation feels busy, but it rarely gets you selected.",
    "Because one honest system beats ten open tabs and three half-finished playlists.",
    "Because the student who knows exactly what to improve usually wins over the student who only studies longer.",
  ]

  return (
    <section className="bg-[linear-gradient(135deg,#0f172a_0%,#14213d_54%,#1d4ed8_100%)] text-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-[1.2fr_.8fr] md:px-6 md:py-14">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-white/82">
            <span className="size-2 rounded-full bg-emerald-300" />
            Why join StudyBench
          </div>
          <div className="space-y-3">
            <h2 className="max-w-3xl font-heading text-3xl leading-tight font-bold tracking-[-0.03em] md:text-[2.45rem]">
              You are not here to look prepared. You are here to get placed.
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-white/78 md:text-[15px]">
              StudyBench is for serious students who are done with scattered prep,
              recycled advice and fake confidence. It gives you one place to see
              what is weak, what to study next and how close you really are to a
              company-level cutoff. Start free with no card. Upgrade only when you want
              every section, every company mock, and full PYQ depth.
            </p>
          </div>

          <div className="grid gap-2.5">
            {reasons.map((reason) => (
              <div
                key={reason}
                className="flex items-start gap-3 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-sm"
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white text-slate-950">
                  <Icon name="Check" className="size-3.5" />
                </span>
                <p className="text-sm leading-6 text-white/90">{reason}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <StartCta
              placement="why_join_primary"
              className="bg-white text-slate-950 hover:bg-white/92"
            >
              Create your account
            </StartCta>
            <Button asChild variant="outline" className="border-white/25 bg-white/8 text-white hover:bg-white/14 hover:text-white">
              <TrackedLink href="#pricing" placement="why_join_pricing">
                See ₹249 Premium
              </TrackedLink>
            </Button>
          </div>
        </div>

        <div className="flex h-full flex-col justify-between gap-4 rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.05))] p-5 backdrop-blur-sm">
          <div>
            <p className="text-sm font-semibold text-white/82">
              What strong students pay for
            </p>
            <div className="mt-4 space-y-3">
              <MetricLine label="Next step clarity" value="Daily" />
              <MetricLine label="Full company depth" value="Unlocked" />
              <MetricLine label="Mock pressure practice" value="Real" />
              <MetricLine label="Weak-topic repair" value="Faster" />
            </div>
          </div>

          <div className="rounded-2xl bg-[#fff7ed] p-4 text-slate-950">
            <p className="text-xs font-semibold tracking-[0.14em] uppercase text-slate-500">
              Premium
            </p>
            <p className="mt-2 font-heading text-3xl font-bold">
              {premiumPriceLabel()}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              One-time payment for lifetime access. Limited time period offer.
            </p>
            <StartCta placement="why_join_join_now" className="mt-4 w-full bg-slate-950 text-white hover:bg-slate-900">
              Join now
            </StartCta>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProofStrip() {
  return (
    <section className="bg-muted/35">
      <div className="mx-auto grid max-w-6xl gap-3 px-4 py-6 md:grid-cols-4 md:px-6">
        {PROOF_POINTS.map((point) => (
          <div key={point.label} className="rounded-xl border border-border/80 bg-background/85 px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {point.label}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{point.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/10 px-3 py-3">
      <span className="text-sm text-white/72">{label}</span>
      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-950">
        {value}
      </span>
    </div>
  )
}

function ProblemSection() {
  const cards = [
    {
      icon: "SearchX",
      title: "Most students lose time to scattered prep",
      body: "YouTube for aptitude, Telegram for PYQs, random blogs for HR, and no clear way to know what actually improves your odds.",
    },
    {
      icon: "ListChecks",
      title: "One clear next step, every single day",
      body: "Pick a company, finish one chapter, take one mock, review one weak area. That's all it takes to build real consistency.",
    },
    {
      icon: "TrendingUp",
      title: "Free plan first, Premium when you're ready",
      body: "Start with full access to Section 1 across all tracks. When you want deeper mocks, coding, and PYQ banks — upgrade for ₹249.",
    },
  ]

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-bold tracking-[-0.03em]">
            Why students choose StudyBench
          </h2>
          <p className="mt-2 text-muted-foreground">
            The app is built for students who need direction before volume:
            one target company, one next chapter, one mock score and one honest readiness view.
          </p>
        </div>
        <StartCta placement="problem_section_cta">
          Try the free plan
        </StartCta>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-border bg-card p-5">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon name={card.icon} className="size-5" />
            </span>
            <h3 className="mt-4 font-heading text-lg font-semibold">{card.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {card.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FeatureBento() {
  const features = [
    {
      icon: "Target",
      title: "Company-wise tracks",
      body: "Prepare differently for TCS, Infosys, Wipro, Accenture, Zoho, Cognizant and core placement prep.",
    },
    {
      icon: "BookOpen",
      title: "PYQ-style practice",
      body: "Pattern-aligned questions help students understand how each company actually tests aptitude, verbal and coding basics.",
    },
    {
      icon: "ClipboardList",
      title: "Timed mock tests",
      body: "Section-wise mock analysis shows whether the problem is speed, pressure, accuracy or a specific weak topic.",
    },
    {
      icon: "Code2",
      title: "Coding ladder",
      body: "Solve company-relevant problems with visible tests, hidden edge cases and practical editorials.",
    },
    {
      icon: "Mic",
      title: "Interview and communication",
      body: "Technical, HR, managerial and communication preparation live in the same product instead of separate tabs and notes.",
    },
    {
      icon: "BarChart3",
      title: "Readiness tracking",
      body: "The app turns daily actions into progress, weak-topic visibility and a single company-wise readiness score.",
    },
  ]

  return (
    <section className="bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-bold tracking-[-0.03em]">
            Everything a fresher needs in one prep flow
          </h2>
          <p className="mt-2 text-muted-foreground">
            Aptitude, coding, mocks, PYQs, interview practice and readiness tracking —
            connected into one daily routine instead of ten scattered tabs.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-background p-5"
            >
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon name={feature.icon} className="size-5" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MethodSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
      <div className="mb-8 max-w-2xl">
        <h2 className="font-heading text-3xl font-bold tracking-[-0.03em]">
          Built around honest readiness, not fake guarantees
        </h2>
        <p className="mt-2 text-muted-foreground">
          Your readiness score only goes up when you actually improve. No shortcuts,
          no inflated numbers — just an honest picture of where you stand.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {METHOD_PRINCIPLES.map((principle) => (
          <div
            key={principle.title}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon name={principle.icon} className="size-5" />
            </span>
            <h3 className="mt-4 font-heading text-lg font-semibold">{principle.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {principle.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section id="pricing" className="bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-bold tracking-[-0.03em]">
            Free gets you started. Premium gives you the full placement engine.
          </h2>
          <p className="mt-2 text-muted-foreground">
            Start without a card. Upgrade for {premiumPriceLabel()} when you want every
            section, every company mock, full PYQ depth, coding practice and detailed analytics.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-border bg-background p-6">
            <p className="text-sm font-semibold text-muted-foreground">Free</p>
            <p className="mt-2 font-heading text-3xl font-bold">Rs 0</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Enough to understand the flow, start learning, and see whether the system fits your pace.
            </p>

            <div className="mt-5 space-y-3">
              {PLAN_FEATURES.slice(0, 4).map((row) => (
                <div key={row.feature} className="rounded-xl bg-muted/55 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {row.feature}
                  </p>
                  <p className="mt-1 text-sm">{row.free}</p>
                </div>
              ))}
            </div>

            <StartCta placement="pricing_free" variant="outline" className="mt-6 w-full">
              Start free
            </StartCta>
          </div>

          <div className="rounded-2xl border border-primary/25 bg-background p-6 shadow-[0_30px_80px_-50px_oklch(0.2_0.03_90/_0.35)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  Best for serious placement prep
                </p>
                <p className="mt-3 font-heading text-3xl font-bold">{premiumPriceLabel()}</p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Unlock deeper sections, full PYQ banks, company mock series, coding depth and better analytics. One-time payment for lifetime access.
                </p>
              </div>
              <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Why people pay
                </p>
                <p className="mt-1 text-sm font-medium">
                  More depth, more reps, better odds
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {PLAN_FEATURES.map((row) => (
                <div key={row.feature} className="rounded-xl bg-muted/50 px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {row.feature}
                  </p>
                  <p className="mt-1 text-sm font-medium">{row.premium}</p>
                </div>
              ))}
            </div>

            <StartCta placement="pricing_premium_path" className="mt-6 w-full">
              Start free — no card needed
            </StartCta>
          </div>
        </div>
      </div>
    </section>
  )
}

function PrepJourneysSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <h2 className="font-heading text-3xl font-bold tracking-[-0.03em]">
            Placed Students ❤️ StudyBench
          </h2>
          <p className="mt-2 text-muted-foreground">
            See how real freshers cleared their campus selection rounds using our company tracks, mocks, and practice tools.
          </p>
        </div>
        <StartCta placement="prep_journeys_cta">
          Start your journey
        </StartCta>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <article key={t.name} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Icon name="CircleCheckBig" className="size-3.5" /> Successful Placement
                </span>
                <span className="text-muted-foreground/30 font-serif text-3xl leading-none">&ldquo;</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground italic">
                {t.content}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
              <span className="grid size-9 place-items-center rounded-full bg-[linear-gradient(135deg,var(--primary),oklch(0.6_0.2_260))] font-heading text-xs font-bold text-primary-foreground font-mono">
                {t.avatar}
              </span>
              <div>
                <p className="font-heading text-sm font-semibold leading-none">{t.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function HomeFaqSection() {
  const featuredFaqs = FAQS.slice(0, 4)

  return (
    <section className="bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h2 className="font-heading text-3xl font-bold tracking-[-0.03em]">
              Questions students search before they start placement prep
            </h2>
            <p className="mt-2 text-muted-foreground">
              Quick answers to the most common questions about how StudyBench works.
            </p>
          </div>
          <Button asChild variant="outline">
            <TrackedLink href="/faq" placement="home_faq_open">
              View all FAQs
            </TrackedLink>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {featuredFaqs.map((faq) => (
            <article key={faq.id} className="rounded-2xl border border-border bg-background p-5">
              <h3 className="font-heading text-lg font-semibold">{faq.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer.replace(/\*\*/g, "")}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <p className="font-heading text-lg font-semibold">Ready to try the free plan?</p>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Start with the free flow, see your first readiness signals, then decide if the deeper premium plan is worth it for you.
          </p>
          <StartCta placement="home_faq_cta" className="mt-4">
            Start free
          </StartCta>
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <div className="rounded-2xl bg-primary p-8 text-primary-foreground md:p-10">
        <h2 className="max-w-3xl font-heading text-3xl font-bold tracking-[-0.03em]">
          Stop guessing what to study next. Start with your first company track today.
        </h2>
        <p className="mt-3 max-w-2xl text-primary-foreground/85">
          Build a real placement routine with lessons, PYQs, mock tests, coding drills,
          interviews and one readiness score that keeps you honest.
        </p>
        <StartCta placement="final_cta" className="mt-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
          Start free
        </StartCta>
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
        <p>Copyright {new Date().getFullYear()} StudyBench. All rights reserved.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/prep" className="hover:text-foreground">
            Company guides
          </Link>
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  )
}

