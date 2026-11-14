"use client"

import { PREMIUM_ANNUAL_PRICE_INR, PREMIUM_SIX_MONTH_PRICE_INR } from "@/lib/access"
import { cn } from "@/lib/utils"

/** Stable display of the available Premium durations. */
export function LaunchOffer({
  variant = "full",
  className,
}: {
  variant?: "full" | "compact"
  className?: string
}) {
  const priceClass = variant === "compact" ? "text-sm" : "text-xl"
  return (
    <div className={cn("flex flex-wrap gap-x-5 gap-y-2", className)}>
      <span className="flex flex-col">
        <strong className={cn("font-heading font-bold", priceClass)}>₹{PREMIUM_SIX_MONTH_PRICE_INR} / 6 months</strong>
        <span className="text-xs text-muted-foreground">180 days · Referrer earns ₹25</span>
      </span>
      <span className="flex flex-col">
        <strong className={cn("font-heading font-bold", priceClass)}>₹{PREMIUM_ANNUAL_PRICE_INR} / 1 year</strong>
        <span className="text-xs text-muted-foreground">365 days · Referrer earns ₹50</span>
      </span>
    </div>
  )
}

/** Compact price banner retained for existing page integrations. */
export function LaunchOfferBanner({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card px-4 py-3", className)}>
      <p className="text-sm font-semibold">StudyBench Premium plans</p>
      <p className="mt-1 text-xs text-muted-foreground">₹{PREMIUM_SIX_MONTH_PRICE_INR} for 6 months or ₹{PREMIUM_ANNUAL_PRICE_INR} for 1 year.</p>
    </div>
  )
}
