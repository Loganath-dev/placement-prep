"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { StudyBenchMark, StudyBenchWordmark } from "@/components/app/brand"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Icon } from "@/components/app/icon"
import { track } from "@/lib/analytics"
import { useStoreState } from "@/lib/store"
import { SITE_URL } from "@/lib/content/blocks"
import { getCompany } from "@/lib/data/companies"
import { computePRI } from "@/lib/scoring"

const NAV_LINKS = [
  { href: "/prep", label: "Company guides" },
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
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <StudyBenchWordmark href="/" />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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

export function ShareScoreCta() {
  const { state, hydrated } = useStoreState()
  const primary = state.primary
  const company = getCompany(primary)
  const pri = hydrated ? computePRI(primary, state.progress[primary]) : 0
  const hasRealScore = hydrated && state.onboarded && pri > 0

  const shareText = hasRealScore
    ? `My ${company.short} placement readiness is ${pri}/100 on StudyBench. Track yours free:`
    : "I am preparing for campus placements on StudyBench. Track your readiness free:"
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${SITE_URL}`)}`

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-10 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className="font-heading text-2xl font-bold">
            {hasRealScore
              ? `Your ${company.short} readiness is ${pri}/100`
              : "Know someone preparing for placements?"}
          </p>
          <p className="mt-2 text-muted-foreground">
            {hasRealScore
              ? "Share your real readiness score with a friend on WhatsApp."
              : "Send them a cleaner way to prepare than scattered notes and random videos."}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("marketing_cta_click", { placement: "whatsapp_share" })}
            className="inline-flex items-center gap-2 rounded-lg border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-2.5 text-sm font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366]/20"
          >
            <Icon name="Share2" className="size-4" />
            Share on WhatsApp
          </a>
          <StartCta placement="share_section_primary">
            Start your own prep
          </StartCta>
        </div>
      </div>
    </section>
  )
}
