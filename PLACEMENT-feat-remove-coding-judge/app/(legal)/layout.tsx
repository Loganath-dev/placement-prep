import Link from "next/link"
import { StudyBenchWordmark } from "@/components/app/brand"
import { Icon } from "@/components/app/icon"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <StudyBenchWordmark href="/" size="compact" />
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <Icon name="ChevronRight" className="size-4 rotate-180" /> Back to home
          </Link>
        </div>
      </header>

      {children}

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} StudyBench. All rights reserved.</span>
          <nav className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms &amp; Conditions
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
