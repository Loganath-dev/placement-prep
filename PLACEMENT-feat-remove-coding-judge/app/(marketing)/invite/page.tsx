import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { JsonLd } from "@/components/app/json-ld"
import { SITE_NAME, SITE_URL } from "@/lib/content/blocks"

export const metadata: Metadata = {
  title: `Start preparing with ${SITE_NAME}`,
  description: `Free campus placement preparation for TCS, Infosys, Wipro, Accenture and more on ${SITE_NAME}.`,
  robots: { index: false },
}

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Invite", item: `${SITE_URL}/invite` },
  ],
}

const FEATURES = [
  { icon: "BookOpenCheck", label: "Company prep tracks", detail: "TCS, Infosys, Wipro, Accenture, Zoho, Cognizant" },
  { icon: "Target", label: "Placement Readiness Index", detail: "Honest 0-100 score that shows where you actually stand" },
  { icon: "Trophy", label: "Mock tests", detail: "Company-pattern full-length mocks with detailed analysis" },
  { icon: "Code2", label: "Coding practice", detail: "DSA problems with in-browser code execution" },
]

export default async function InvitePage() {
  const signupHref = "/auth/signup"
  const loginHref = "/auth/login"

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:py-16">
      <JsonLd data={breadcrumb} />

      <div className="flex flex-col items-center gap-6 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon name="Users" className="size-8" />
        </span>

        <div>
          <h1 className="font-heading text-3xl font-bold leading-tight md:text-4xl">
            Start preparing with {SITE_NAME}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            Free campus placement prep for TCS, Infosys, Wipro, Accenture and more — with a real readiness score.
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-start gap-3 rounded-xl border border-border p-4 text-left">
              <Icon name={f.icon as string} className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <Card className="w-full border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <p className="font-heading text-lg font-semibold">
              Create your free account
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              No credit card needed. Free gives you all of Section 1 in every company track.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={signupHref}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
              >
                Start free <Icon name="ArrowRight" className="size-4" />
              </Link>
              <Link
                href={loginHref}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-6 py-3 font-semibold hover:bg-muted/60"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          {SITE_NAME} is a placement learning app. We do not guarantee interview calls, jobs, placement outcomes or selection by any company.
        </p>
      </div>
    </main>
  )
}
