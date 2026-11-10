"use client"

import { cn } from "@/lib/utils"

/** Shared display for the two currently available Premium durations. */
export function LaunchOffer({variant="full",className}:{variant?:"full"|"compact";className?:string}) {
 const size=variant==="compact" ? "text-base" : "text-xl"
 return <div className={cn("flex flex-wrap gap-x-5 gap-y-2",className)}>
  <span className="flex flex-col"><strong className={cn("font-heading font-bold",size)}>₹299 / 6 months</strong><span className="text-xs text-muted-foreground">183 days · ₹25 referral reward</span></span>
  <span className="flex flex-col"><strong className={cn("font-heading font-bold",size)}>₹499 / 1 year</strong><span className="text-xs text-muted-foreground">365 days · ₹50 referral reward</span></span>
 </div>
}

/** No countdown or fake scarcity. */
export function LaunchOfferBanner({className}:{className?:string}) { void className; return null }
