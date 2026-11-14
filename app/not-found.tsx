import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StudyBenchWordmark } from "@/app/brand"

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-5 py-16">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <StudyBenchWordmark href="/" size="compact" />
        <p className="mt-12 text-sm font-semibold uppercase tracking-[0.18em] text-primary">404 · Page not found</p>
        <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight">This page doesn’t exist.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The link may be outdated, or the page may have moved. Your learning progress is not affected.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild><Link href="/">Go to StudyBench</Link></Button>
          <Button asChild variant="outline"><Link href="/faq">Visit help</Link></Button>
        </div>
      </div>
    </main>
  )
}
