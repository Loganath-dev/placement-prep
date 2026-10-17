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
      <div className={cn("flex flex-col", className)}>
        <span className="font-heading text-base font-bold">
          ₹{PREMIUM_PRICE_INR}/{PREMIUM_DURATION_LABEL}
        </span>
        <span className="text-xs font-medium text-destructive animate-pulse mt-0.5">
          Limited time period offer
        </span>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <p className="font-heading text-2xl font-bold">
        ₹{PREMIUM_PRICE_INR}/{PREMIUM_DURATION_LABEL}
      </p>
      <span className="text-sm font-medium text-destructive animate-pulse mt-1">
        Limited time period offer
      </span>
    </div>
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
