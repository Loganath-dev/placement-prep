import Link from "next/link"
import { StudyBenchWordmark } from "@/components/app/brand"
import { Button } from "@/components/ui/button"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <StudyBenchWordmark href="/" size="compact" />
          <nav className="flex items-center gap-1 text-sm font-medium sm:gap-4">
            <Link href="/blog" className="px-2 text-muted-foreground hover:text-foreground">
              Blog
            </Link>
            <Link href="/faq" className="px-2 text-muted-foreground hover:text-foreground">
              FAQ
            </Link>
            <Button asChild size="sm">
              <Link href="/auth/signup">Start free</Link>
            </Button>
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} StudyBench. All rights reserved.</span>
          <nav className="flex flex-wrap items-center gap-4">
            <Link href="/blog" className="hover:text-foreground">
              Blog
            </Link>
            <Link href="/faq" className="hover:text-foreground">
              FAQ
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
