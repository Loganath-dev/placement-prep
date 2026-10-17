"use client"

import Link from "next/link"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/app/icon"
import { track } from "@/lib/analytics"

export function TrackedLink({ href, placement, children, className }: any) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => track("marketing_cta_click", { placement })}
    >
      {children}
    </Link>
  )
}

export function StartCta({ placement, children, size, className, variant }: any) {
  return (
    <Button
      asChild
      size={size}
      variant={variant}
      className={className}
      onClick={() => track("marketing_start_cta_click", { placement })}
    >
      <a href="/auth/signup" rel="noopener noreferrer">
        {children}
      </a>
    </Button>
  )
}

export function ShareScoreCta({ className }: any) {
  return (
    <Button asChild variant="ghost" className={className}>
      <a href="/share-score">Share your score</a>
    </Button>
  )
}

export function SiteHeader() {
  const [open] = React.useState(false)
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-heading text-lg font-bold">
            StudyBench
          </Link>
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex gap-4">
              <Link href="/prep">Company guides</Link>
              <Link href="/blog">Blog</Link>
              <Link href="#pricing">Pricing</Link>
            </nav>
            <StartCta placement="header" size="sm">Get started</StartCta>
          </div>
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
