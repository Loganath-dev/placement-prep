import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { JsonLd } from "@/components/app/json-ld"
import { COMPANIES, COMPANY_BY_ID, getCompany } from "@/lib/data/companies"
import { getSections } from "@/lib/data/content"
import { SITE_NAME, SITE_URL } from "@/lib/content/blocks"
import type { CompanyId } from "@/lib/types"

export function generateStaticParams() {
  return COMPANIES.filter((c) => !c.isGeneral).map((c) => ({ company: c.id }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ company: string }>
}): Promise<Metadata> {
  const { company: companyId } = await params
  const company = COMPANY_BY_ID[companyId as CompanyId]
  if (!company) return { title: "Company not found - StudyBench" }
  const url = `${SITE_URL}/prep/${company.id}`
  const title = `${company.name} Placement Preparation 2026 | ${SITE_NAME}`
  const description = `Free ${company.name} placement prep: exam pattern, eligibility, sample aptitude questions and coding tips for campus hiring 2026. Practise with StudyBench.`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

function qaPageJsonLd(companyId: CompanyId) {
  const company = getCompany(companyId)
  const sections = getSections(companyId)
  const sampleQuestions: { q: string; a: string }[] = []
  for (const section of sections) {
    for (const chapter of section.chapters) {
      const eq = chapter.quiz.find((qu) => qu.difficulty === "easy")
      if (eq) {
        sampleQuestions.push({
          q: eq.prompt,
          a: `${eq.options[eq.answer]}. ${eq.explanation}`,
        })
        if (sampleQuestions.length >= 6) break
      }
    }
    if (sampleQuestions.length >= 6) break
  }

  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    name: `${company.name} Placement Preparation - Sample Questions`,
    description: `Practice questions and answers for ${company.name} campus placement preparation.`,
    url: `${SITE_URL}/prep/${companyId}`,
    mainEntity: sampleQuestions.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  }
}

function breadcrumbJsonLd(companyId: CompanyId) {
  const company = getCompany(companyId)
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Prep guides", item: `${SITE_URL}/prep` },
      { "@type": "ListItem", position: 3, name: `${company.name} Prep`, item: `${SITE_URL}/prep/${companyId}` },
    ],
  }
}

export default async function PrepCompanyPage({
  params,
}: {
  params: Promise<{ company: string }>
}) {
  const { company: companyId } = await params
  if (!COMPANY_BY_ID[companyId as CompanyId]) notFound()

  const company = getCompany(companyId as CompanyId)
  const sections = getSections(companyId as CompanyId)

  // Collect one easy sample question per section (up to 6).
  const sampleQs: { section: string; prompt: string; options: string[]; answer: number; explanation: string }[] = []
  for (const section of sections) {
    for (const chapter of section.chapters) {
      const eq = chapter.quiz.find((q) => q.difficulty === "easy")
      if (eq) {
        sampleQs.push({
          section: section.name,
          prompt: eq.prompt,
          options: eq.options,
          answer: eq.answer,
          explanation: eq.explanation,
        })
        break
      }
    }
    if (sampleQs.length >= 6) break
  }

  const eligibility = company.eligibility

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <JsonLd data={qaPageJsonLd(companyId as CompanyId)} />
      <JsonLd data={breadcrumbJsonLd(companyId as CompanyId)} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <Icon name="ChevronRight" className="size-3.5" />
        <Link href="/prep" className="hover:text-foreground">Prep guides</Link>
        <Icon name="ChevronRight" className="size-3.5" />
        <span className="text-foreground">{company.name}</span>
      </nav>

      <header className="mt-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {company.sector}
          </span>
        </div>
        <h1 className="font-heading text-3xl font-bold leading-tight md:text-4xl">
          {company.name} Placement Preparation 2026
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          {company.blurb} - eligibility, exam pattern, and sample practice questions.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link
            href={`/auth/signup?company=${company.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Start {company.short} prep free <Icon name="ArrowRight" className="size-4" />
          </Link>
          <Link
            href={`/auth/signup?company=${company.id}&next=mock`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted/50"
          >
            Try a {company.short} mock
          </Link>
        </div>
      </header>

      {/* Eligibility */}
      {eligibility ? (
        <section className="mt-8 space-y-4" aria-labelledby="eligibility-heading">
          <h2 id="eligibility-heading" className="font-heading text-xl font-semibold md:text-2xl">
            Eligibility criteria
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow icon="GraduationCap" label="Academic" value={eligibility.cgpa} />
            <InfoRow icon="AlertCircle" label="Backlogs" value={eligibility.backlogs} />
            {eligibility.tenthTwelfth ? (
              <InfoRow icon="FileText" label="10th / 12th" value={eligibility.tenthTwelfth} />
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Exam pattern */}
      {eligibility?.pattern ? (
        <section className="mt-8 space-y-4" aria-labelledby="pattern-heading">
          <h2 id="pattern-heading" className="font-heading text-xl font-semibold md:text-2xl">
            Exam pattern
          </h2>
          <Card>
            <CardContent className="space-y-2 p-5">
              {eligibility.pattern.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          {eligibility.rounds ? (
            <div className="flex flex-wrap gap-2">
              {eligibility.rounds.map((r) => (
                <span key={r} className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium">
                  {r}
                </span>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Sample questions */}
      <section className="mt-10 space-y-4" aria-labelledby="questions-heading">
        <h2 id="questions-heading" className="font-heading text-xl font-semibold md:text-2xl">
          Sample practice questions
        </h2>
        <p className="text-sm text-muted-foreground">
          These are indicative questions from the {company.name} prep track on {SITE_NAME}.
          Answers and explanations are shown below each question.
        </p>
        <div className="space-y-4">
          {sampleQs.map((item, qi) => (
            <Card key={qi}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading font-semibold leading-snug">
                    Q{qi + 1}. {item.prompt}
                  </h3>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {item.section}
                  </span>
                </div>
                <ol className="grid gap-1.5 text-sm">
                  {item.options.map((opt, oi) => (
                    <li
                      key={oi}
                      className={
                        oi === item.answer
                          ? "flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 px-3 py-2"
                          : "flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-muted-foreground"
                      }
                    >
                      <span className="font-semibold">{String.fromCharCode(65 + oi)}.</span>
                      <span>{opt}</span>
                      {oi === item.answer ? (
                        <Icon name="Check" className="ml-auto size-4 text-[color:var(--success)]" />
                      ) : null}
                    </li>
                  ))}
                </ol>
                <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Explanation: </span>
                  {item.explanation}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* What to prepare */}
      <section className="mt-10 space-y-4" aria-labelledby="topics-heading">
        <h2 id="topics-heading" className="font-heading text-xl font-semibold md:text-2xl">
          What to prepare for {company.short}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {sections.slice(0, 6).map((s) => (
            <div key={s.id} className="flex items-start gap-3 rounded-xl border border-border p-4">
              <Icon name={s.icon as string} className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-muted-foreground">{s.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <Card className="mt-10 border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="font-heading text-xl font-semibold">
            Start your {company.short} prep today — free
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            {SITE_NAME} gives you the full {company.name} track with lessons, practice questions, mock tests, and a Placement Readiness Index that shows exactly where you stand.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Start preparing free <Icon name="ArrowRight" className="size-4" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted/60"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Cross-links to other companies */}
      <section className="mt-12">
        <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Also prepare for
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {COMPANIES.filter((c) => !c.isGeneral && c.id !== company.id)
            .slice(0, 3)
            .map((c) => (
              <Link key={c.id} href={`/prep/${c.id}`} className="group">
                <Card className="h-full transition-all group-hover:border-primary/40">
                  <CardContent className="space-y-1 p-4">
                    <p className="font-heading font-semibold group-hover:text-primary">{c.short}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{c.blurb}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </section>
    </main>
  )
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border p-4">
      <Icon name={icon as string} className="mt-0.5 size-5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
