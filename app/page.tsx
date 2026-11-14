import type { Metadata } from "next"
import { JsonLd } from "@/app/json-ld"
import { LandingPage } from "@/app/landing-page"
import { FAQS, faqJsonLd } from "@/lib/content/faq"
import {
  courseJsonLd,
  organizationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/seo"

export const metadata: Metadata = {
  title: "Structured learning platform for students",
  description:
    "Learn aptitude, logical and verbal ability, CS core, programming languages and data structures through structured learning paths on StudyBench.",
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
