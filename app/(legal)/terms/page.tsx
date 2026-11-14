import type { Metadata } from "next"
import { LegalDocument } from "@/app/legal-doc"
import { TERMS } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Terms & Conditions - StudyBench",
  description:
    "The terms governing your use of StudyBench, including Premium payments, payment finality, acceptable use, disclaimers and dispute resolution under Indian law.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return <LegalDocument doc={TERMS} />
}


