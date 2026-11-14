import type { Metadata } from "next"
import { JsonLd } from "@/app/json-ld"
import { LandingPage } from "@/app/landing-page"
import { FAQS, faqJsonLd } from "@/lib/content/faq"
import { SITE_URL } from "@/lib/content/blocks"
import {
  courseJsonLd,
  organizationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/seo"

export const metadata: Metadata = {
  title: "Campus Placement Preparation App for Freshers",
  description:
    "Prepare for campus placements with guided aptitude, reasoning, verbal ability, CS fundamentals, coding practice, mock tests and company-specific learning paths.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Campus Placement Preparation App for Freshers | StudyBench",
    description:
      "Build placement skills with guided learning paths, aptitude and coding practice, mock tests and company-specific preparation.",
    url: SITE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Placement Preparation App for Freshers | StudyBench",
    description:
      "Build placement skills with guided learning paths, aptitude and coding practice, mock tests and company-specific preparation.",
  },
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={softwareApplicationJsonLd()} />
      <JsonLd data={courseJsonLd()} />
      <JsonLd data={faqJsonLd(FAQS.slice(0, 4))} />
      <LandingPage />
    </>
  )
}
