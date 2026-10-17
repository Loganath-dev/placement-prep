import type { Metadata } from "next"
import { LegalDocument } from "@/components/app/legal-doc"
import { PRIVACY_POLICY } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Privacy Policy - StudyBench",
  description:
    "How StudyBench collects, uses, shares and protects your personal data, in line with India's DPDP Act, 2023 and the IT Act, 2000.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return <LegalDocument doc={PRIVACY_POLICY} />
}


