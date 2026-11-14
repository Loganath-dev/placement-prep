import { PageHeader } from "@/app/page-header"
import { PricingPlans } from "@/app/pricing-plans"

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-7">
      <PageHeader
        eyebrow="StudyBench Premium"
        title="Build your placement edge with Premium"
        description="Choose six months or a full year of structured learning, complete practice, company preparation and progress insights. Pay once; access lasts for the period shown."
      />
      <PricingPlans />
    </main>
  )
}
