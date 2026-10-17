import type { Metadata } from "next"
import { JsonLd } from "@/components/app/json-ld"
import { LandingPage } from "@/components/app/landing-page"
import { FAQS, faqJsonLd } from "@/lib/content/faq"
import {
  courseJsonLd,
  organizationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/seo"

export const metadata: Metadata = {
  title: "Placement preparation app for freshers in India",
  description:
    "Prepare for campus placements with company-wise tracks, aptitude, coding, interview prep, PYQs, mock tests and readiness analytics on StudyBench.",
  alternates: { canonical: "/" },
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
