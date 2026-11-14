"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { StudyBenchMark, StudyBenchWordmark } from "@/app/brand"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Icon } from "@/components/app-icon"
import { track } from "@/lib/analytics"
import { useStoreState } from "@/lib/store"

const NAV_LINKS = [
  { href: "#learning-paths", label: "Learning paths" },
  { href: "/blog", label: "Blog" },
  { href: "#pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
]

export function StartCta({
  placement,
  children,
  size,
  variant,
  className,
}: {
  placement: string
  children?: React.ReactNode
  size?: "default" | "lg"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  className?: string
}) {
  const { state, hydrated } = useStoreState()
  const signedUp = hydrated && state.onboarded
  const startHref = signedUp ? "/dashboard" : "/auth/signup"

  return (
    <Button asChild size={size} variant={variant} className={className}>
      <Link href={startHref} onClick={() => track("marketing_cta_click", { placement })}>
        {children || (signedUp ? "Open app" : "Start free")}
        <Icon name="ArrowRight" className="size-4" />
      </Link>
    </Button>
  )
}

export function TrackedLink({ href, placement, className, children }: { href: string, placement: string, className?: string, children: React.ReactNode }) {
  return (
    <Link href={href} className={className} onClick={() => track("marketing_cta_click", { placement })}>
      {children}
    </Link>
  )
}

export function SiteHeader() {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-[#e5ebf3] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <StudyBenchWordmark href="/" />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#66758c] transition-colors hover:bg-[#f3f6fb] hover:text-[#1c2b45]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/auth/login">Sign in</Link>
          </Button>
          
          <StartCta placement="header_primary" />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 font-heading">
                  <StudyBenchMark className="size-8" />
                  <span>
                    <span className="font-medium text-foreground/70">Study</span>
                    <span className="font-extrabold text-primary">Bench</span>
                  </span>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Site navigation menu.
                </SheetDescription>
              </SheetHeader>
              <nav className="mt-2 flex flex-col gap-1 px-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Sign in
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

