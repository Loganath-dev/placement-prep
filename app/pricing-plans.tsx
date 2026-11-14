"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/app-icon"
import { PLAN_FEATURES } from "@/lib/access"
import { ACTIVE_PURCHASE_PLANS, type PurchasePlan } from "@/lib/subscriptions/plans"
import { useStore } from "@/lib/store"

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void }
  }
}

type RazorpayOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void
  prefill?: { name?: string }
  theme?: { color?: string }
}

const plans = Object.values(ACTIVE_PURCHASE_PLANS)

export function PricingPlans() {
  const { state, activatePremium } = useStore()
  const [checkingOutPlan, setCheckingOutPlan] = React.useState<string | null>(null)

  async function startCheckout(plan: PurchasePlan) {
    if (checkingOutPlan) return
    setCheckingOutPlan(plan.planKey)
    try {
      await loadRazorpayCheckout()
      const orderResponse = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey: plan.planKey }),
      })
      const order = await readApiJson<{
        error?: string
        keyId?: string
        amount?: number
        currency?: string
        orderId?: string
      }>(orderResponse, "Could not start checkout.")
      if (!orderResponse.ok) throw new Error(order.error ?? "Could not start checkout.")
      if (!order.keyId || !order.amount || !order.currency || !order.orderId) {
        throw new Error("Checkout configuration is incomplete. Please contact support.")
      }
      if (!window.Razorpay) throw new Error("Razorpay checkout did not load.")

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "StudyBench",
        description: plan.name,
        order_id: order.orderId,
        prefill: { name: state.profile.name },
        theme: { color: "#218b75" },
        handler: async (response) => {
          const verifyResponse = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          })
          const verified = await readApiJson<{ error?: string; premiumUntil?: string }>(
            verifyResponse,
            "Payment verification failed.",
          )
          if (!verifyResponse.ok) {
            toast.error(verified.error ?? "Payment verification failed")
            return
          }
          activatePremium(verified.premiumUntil)
          toast.success("Premium activated", {
            description: `Your ${plan.entitlementDays === 180 ? "six-month" : "one-year"} plan is active.`,
          })
        },
      })
      checkout.open()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start checkout")
    } finally {
      setCheckingOutPlan(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Invest in your preparation</p>
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Make every study session count.</h2>
        <p className="text-sm leading-6 text-muted-foreground">Choose the access period that fits your placement timeline. One payment, clear duration and no automatic renewal.</p>
      </div>
      {state.premium ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-600/20 bg-emerald-600/5 p-4 text-sm">
          <Icon name="CircleCheckBig" className="mt-0.5 size-5 text-emerald-700" />
          <div>
            <p className="font-semibold">Premium is active</p>
            <p className="mt-1 text-muted-foreground">You can add more time by choosing a plan below.</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => {
          const annual = plan.entitlementDays === 365
          const price = plan.amountPaise / 100
          const duration = annual ? "1 year" : "6 months"
          return (
            <Card key={plan.planKey} className={annual ? "relative border-primary/45 bg-primary/[0.025] shadow-[0_20px_60px_-42px_var(--primary)] ring-1 ring-primary/15" : "border-border"}>
              {annual ? <span className="absolute right-4 top-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">BEST VALUE · SAVE ₹99</span> : null}
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 font-heading text-lg">
                  <Icon name={annual ? "Crown" : "CalendarDays"} className="size-5 text-primary" />
                  Premium · {duration}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="font-heading text-4xl font-bold tracking-tight">₹{price}</p>
                  <p className="mt-1 text-sm text-muted-foreground">One-time payment · {plan.entitlementDays} days of access</p>
                  <p className="mt-2 text-xs font-medium text-muted-foreground">About ₹{Math.round(price / (annual ? 12 : 6))} per month · no auto-renewal</p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><Icon name="Check" className="size-4 shrink-0 text-primary" />Every published learning path, lesson flashcard and chapter</li>
                  <li className="flex gap-2"><Icon name="Check" className="size-4 shrink-0 text-primary" />Full lesson practice, chapter assessments and company tracks</li>
                  <li className="flex gap-2"><Icon name="Check" className="size-4 shrink-0 text-primary" />Mock tests, mistake review and detailed learning analytics</li>
                </ul>
                <Button className="w-full" size="lg" onClick={() => void startCheckout(plan)} disabled={checkingOutPlan !== null}>
                  {checkingOutPlan === plan.planKey ? "Opening checkout…" : `Continue · ₹${price}`}
                  {checkingOutPlan !== plan.planKey ? <Icon name="ArrowRight" className="ml-2 size-4" /> : null}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">What Premium unlocks</CardTitle></CardHeader>
        <CardContent className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {PLAN_FEATURES.map((feature) => (
            <div key={feature.feature} className="flex gap-2 text-sm">
              <Icon name="Check" className="mt-0.5 size-4 shrink-0 text-primary" />
              <span><strong>{feature.feature}:</strong> <span className="text-muted-foreground">{feature.premium}</span></span>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        All prices are displayed before checkout. No hidden fees or automatic renewal. Questions? <Link href="/terms" className="font-medium text-primary underline-offset-4 hover:underline">Review the terms</Link> before purchasing.
      </p>
    </div>
  )
}

async function readApiJson<T extends { error?: string }>(response: Response, fallbackMessage: string): Promise<T> {
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) return (await response.json()) as T
  const body = await response.text()
  if (body.toLowerCase().includes("<!doctype") || body.toLowerCase().includes("<html")) {
    throw new Error(response.status === 401
      ? "Please sign in again before upgrading."
      : "The payment service is temporarily unavailable. Please try again later.")
  }
  throw new Error(body.trim() || fallbackMessage)
}

function loadRazorpayCheckout() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Checkout is available only in the browser."))
      return
    }
    if (window.Razorpay) {
      resolve()
      return
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    )
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => reject(new Error("Razorpay checkout failed to load.")), { once: true })
      return
    }
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Razorpay checkout failed to load."))
    document.body.appendChild(script)
  })
}
