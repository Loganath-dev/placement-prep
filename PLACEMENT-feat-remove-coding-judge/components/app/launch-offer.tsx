"use client"

import { PREMIUM_DURATION_LABEL, PREMIUM_PRICE_INR } from "@/lib/access"
import { cn } from "@/lib/utils"

/**
 * Fixed premium pricing block. The timed launch-offer treatment and countdown
 * were removed so the app now shows a simple, stable price everywhere.
 */
export function LaunchOffer({
  variant = "full",
  className,
}: {
  variant?: "full" | "compact"
  className?: string
}) {
  if (variant === "compact") {
    return (
      <span className={cn("font-heading text-base font-bold", className)}>
        ₹{PREMIUM_PRICE_INR}
        <span className="text-xs font-normal text-muted-foreground">/{PREMIUM_DURATION_LABEL}</span>
      </span>
    )
  }

  return (
    <p className={cn("font-heading text-2xl font-bold", className)}>
      ₹{PREMIUM_PRICE_INR}
      <span className="ml-1 text-sm font-normal text-muted-foreground">
        / {PREMIUM_DURATION_LABEL}
      </span>
    </p>
  )
}

/**
 * Legacy export kept so existing imports continue to compile. The promotional
 * top-of-dashboard banner has been removed completely.
 */
export function LaunchOfferBanner({ className }: { className?: string }) {
  void className
  return null
}
