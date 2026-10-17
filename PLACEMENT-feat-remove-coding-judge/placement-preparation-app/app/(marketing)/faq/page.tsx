import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { JsonLd } from "@/components/app/json-ld"
import { withBold } from "@/components/app/rich-text"
import { FAQS, faqJsonLd, type FaqItem } from "@/lib/content/faq"
import { SITE_URL } from "@/lib/content/blocks"

export const metadata: Metadata = {
  title: "Campus Placement Preparation FAQs | StudyBench",
  description:
    "Answers to the most-asked questions about campus placement preparation: how the Placement Readiness Index works, what's free vs Premium, company tracks, content sources and data privacy.",
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: "Campus Placement Preparation FAQs | StudyBench",
    description:
      "How the PRI score works, what's free vs Premium, company tracks, original content policy and data protection — answered plainly.",
    type: "website",
    url: `${SITE_URL}/faq`,
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "StudyBench campus placement preparation FAQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Placement Preparation FAQs | StudyBench",
    description:
      "How the PRI score works, what's free vs Premium, company tracks, and data protection — answered plainly.",
  },
}

const CATEGORIES: FaqItem["category"][] = [
  "Getting started",
  "Preparation",
  "Pricing",
  "Content & data",
]

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <JsonLd data={faqJsonLd()} />

      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
          <Icon name="CircleHelp" className="size-3.5" /> Help & FAQ
        </span>
        <h1 className="mt-4 font-heading text-3xl font-bold md:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Everything about preparing for campus placements with StudyBench - readiness scoring,
          pricing, content and privacy.
        </p>
      </div>

      <div className="mt-10 space-y-8">
        {CATEGORIES.map((cat) => {
          const items = FAQS.filter((f) => f.category === cat)
          if (items.length === 0) return null
          return (
            <section key={cat}>
              <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {cat}
              </h2>
              <div className="space-y-3">
                {items.map((f) => (
                  <Card key={f.id} id={f.id} className="scroll-mt-20">
                    <CardContent className="space-y-2 p-5">
                      <h3 className="font-heading text-base font-semibold">{f.question}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {withBold(f.answer)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <Card className="mt-10 border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="font-heading text-lg font-semibold">Still have a question?</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Start preparing free and explore the full platform, or read our in-depth guides on
            the blog.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Start free <Icon name="ArrowRight" className="size-4" />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50"
            >
              Read the blog
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}


