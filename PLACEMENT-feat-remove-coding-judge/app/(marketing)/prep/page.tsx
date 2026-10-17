import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { JsonLd } from "@/components/app/json-ld"
import { COMPANIES } from "@/lib/data/companies"
import { SITE_NAME, SITE_URL } from "@/lib/content/blocks"

export const metadata: Metadata = {
  title: `Company Placement Prep Guides 2026 | ${SITE_NAME}`,
  description:
    "Free placement preparation guides for TCS, Infosys, Wipro, Accenture, Zoho, Cognizant and more. Exam patterns, eligibility, and sample questions for campus hiring 2026.",
  alternates: { canonical: `${SITE_URL}/prep` },
  openGraph: {
    title: `Company Placement Prep Guides 2026 | ${SITE_NAME}`,
    description:
      "Free placement prep guides for TCS, Infosys, Wipro, Accenture, Zoho and Cognizant campus hiring 2026.",
    type: "website",
    url: `${SITE_URL}/prep`,
  },
}

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Prep guides", item: `${SITE_URL}/prep` },
  ],
}

export default function PrepIndexPage() {
  const companies = COMPANIES.filter((c) => !c.isGeneral)
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <JsonLd data={breadcrumb} />

      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <Icon name="ChevronRight" className="size-3.5" />
        <span className="text-foreground">Prep guides</span>
      </nav>

      <header className="mt-6 space-y-3">
        <h1 className="font-heading text-3xl font-bold leading-tight md:text-4xl">
          Campus Placement Prep Guides 2026
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Company-by-company breakdowns: eligibility, exam pattern, and free practice questions for India&apos;s top recruiters.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {companies.map((c) => (
          <Link key={c.id} href={`/prep/${c.id}`} className="group">
            <Card className="h-full transition-all group-hover:border-primary/40">
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-heading font-semibold group-hover:text-primary">{c.name}</p>
                  <Icon name="ChevronRight" className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <span className="inline-block rounded-full bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground">
                  {c.sector}
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">{c.blurb}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-10 border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="font-heading text-xl font-semibold">
            Full prep tracks — free to start
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            {SITE_NAME} builds you a personalised placement route with chapter lessons, practice questions, mock tests, and a Placement Readiness Index — all in one place.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Start preparing free <Icon name="ArrowRight" className="size-4" />
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
