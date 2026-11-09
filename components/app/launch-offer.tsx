"use client"

import { PREMIUM_DURATION_DAYS, PREMIUM_DURATION_LABEL, PREMIUM_PRICE_INR } from "@/lib/access"
import { cn } from "@/lib/utils"

/** Stable annual price. No countdown, fake scarcity, or promotional urgency. */
export function LaunchOffer({variant="full",className}:{variant?:"full"|"compact";className?:string}) {
 if(variant==="compact") return <div className={cn("flex flex-col",className)}>
  <span className="font-heading text-base font-bold">₹{PREMIUM_PRICE_INR}/{PREMIUM_DURATION_LABEL}</span>
  <span className="mt-0.5 text-xs text-muted-foreground">Annual subscription · {PREMIUM_DURATION_DAYS} days</span>
 </div>
 return <div className={cn("flex flex-col",className)}>
  <p className="font-heading text-2xl font-bold">₹{PREMIUM_PRICE_INR}/{PREMIUM_DURATION_LABEL}</p>
  <span className="mt-1 text-sm text-muted-foreground">Annual subscription · {PREMIUM_DURATION_DAYS} days of Premium access</span>
 </div>
}

/** Kept as a no-op for existing imports; the promotional banner was removed. */
export function LaunchOfferBanner({className}:{className?:string}) { void className; return null }
