"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icon } from "@/components/app/icon"
import { LaunchOffer } from "@/components/app/launch-offer"
import { PageHeader } from "@/components/app/page-header"
import { CompanyAvatar } from "@/components/app/ui-bits"
import {
  PLAN_FEATURES,
  PREMIUM_FOOD_COMPARISON_LABEL,
  PREMIUM_MONTHLY_EQUIVALENT_INR,
  premiumPriceLabel,
} from "@/lib/access"
import { SELECTABLE_COMPANIES, getCompany } from "@/lib/data/companies"
import { useStore } from "@/lib/store"
import type { CompanyId, Profile } from "@/lib/types"

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
  handler: (response: RazorpaySuccessResponse) => void
  prefill?: { name?: string }
  theme?: { color?: string }
}

type RazorpaySuccessResponse = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}


export default function SettingsPage() {
  const {
    state,
    userId,
    activatePremium,
    setPrimary,
    addInterested,
    removeInterested,
    updateProfile,
    reset,
    deleteAccount,
  } = useStore()

  const available = SELECTABLE_COMPANIES.filter((c) => !state.interested.includes(c.id))
  const [checkingOut, setCheckingOut] = React.useState(false)
  const [creatorCode, setCreatorCode] = React.useState("")
  const [redeemingCode, setRedeemingCode] = React.useState(false)
  const [renderSecondarySections, setRenderSecondarySections] = React.useState(false)
  const activeUntil = state.premiumUntil ?? null
  const premiumTargetNames = (
    state.interested.length ? state.interested : (["general"] as CompanyId[])
  )
    .slice(0, 3)
    .map((id) => getCompany(id).short)

  React.useEffect(() => {
    const id = window.setTimeout(() => setRenderSecondarySections(true), 0)
    return () => window.clearTimeout(id)
  }, [])

  function tryAdd(id: CompanyId) {
    addInterested(id)
    toast.success(`Added ${getCompany(id).short}`)
  }

  async function startPremiumCheckout() {
    if (checkingOut) return
    setCheckingOut(true)
    try {
      await loadRazorpayCheckout()
      const orderResponse = await fetch("/api/razorpay/order", { method: "POST" })
      const order = await readApiJson<{ error?: string; keyId?: string; amount?: number; currency?: string; orderId?: string }>(
        orderResponse,
        "Could not start checkout.",
      )
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
        description: "StudyBench Premium - 1 year",
        order_id: order.orderId,
        prefill: { name: state.profile.name },
        theme: { color: "#2563eb" },
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
            description: "Payment verified and your plan is active for one year.",
          })
        },
      })
      checkout.open()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start checkout")
    } finally {
      setCheckingOut(false)
    }
  }

  async function redeemCreatorCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!creatorCode.trim() || redeemingCode) return
    setRedeemingCode(true)
    try {
      const response = await fetch("/api/creator/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: creatorCode }),
      })
      const result = await readApiJson<{ error?: string; ok?: boolean; premiumUntil?: string }>(
        response,
        "Could not redeem the creator code.",
      )
      if (!response.ok) throw new Error(result.error ?? "Could not redeem the creator code.")
      activatePremium(result.premiumUntil, "creator")
      setCreatorCode("")
      toast.success("Creator access activated", {
        description: "Premium is unlocked for one year on this account.",
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not redeem the creator code.")
      setRedeemingCode(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account setup"
        title="Settings"
        description="Subscription, target companies and your profile."
      />

      {state.entitlementSource !== "creator" ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="flex items-center gap-2 font-heading text-sm font-semibold">
                <Icon name="KeyRound" className="size-4 text-primary" /> Have a creator code?
              </p>
              <p className="text-sm text-muted-foreground">
                Redeem your one-time invite here to unlock creator access for one year.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <a href="#creator-invite">Redeem creator code</a>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-base">
            <Icon name="Crown" className="size-4 text-primary" /> Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.premium ? (
            <div>
              <p className="flex items-center gap-1.5 font-semibold text-[color:var(--success)]">
                <Icon name="CircleCheckBig" className="size-4" />
                {state.entitlementSource === "creator" ? "Creator access" : "Premium active"}
              </p>
              <p className="text-sm text-muted-foreground">
                All chapters, all company depth, full PYQs, mocks and readiness unlocked.
                {state.entitlementSource === "creator"
                  ? activeUntil
                    ? ` Creator access is valid until ${new Date(activeUntil).toLocaleDateString()}.`
                    : " Owner access is active on this account."
                  : activeUntil
                    ? ` Valid until ${new Date(activeUntil).toLocaleDateString()}.`
                    : ""}
              </p>
            </div>
          ) : (
            <div className="space-y-5 rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,var(--card),var(--accent))] p-5 shadow-[0_28px_70px_-52px_oklch(0.25_0.08_260_/_35%)]">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-2">
                  <p className="font-heading text-lg font-semibold">StudyBench Premium</p>
                  <LaunchOffer />
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    Pay {premiumPriceLabel()} through Razorpay to unlock deeper company
                    preparation, more mocks and better feedback for {premiumTargetNames.join(", ")}.
                    That is about Rs {PREMIUM_MONTHLY_EQUIVALENT_INR}/month - {PREMIUM_FOOD_COMPARISON_LABEL.toLowerCase()}.
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={startPremiumCheckout}
                  disabled={checkingOut}
                  className="shrink-0"
                >
                  {checkingOut ? "Opening checkout..." : `Pay ${premiumPriceLabel()}`}
                  {!checkingOut ? <Icon name="ArrowRight" className="size-4" /> : null}
                </Button>
              </div>

              <div className="rounded-xl border border-border/80 bg-background/80 p-4">
                <p className="text-sm font-semibold">Why people upgrade</p>
                <div className="mt-3 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                  <p className="rounded-xl bg-muted/45 px-3 py-2">
                    Go past the starter section and keep moving through the full track.
                  </p>
                  <p className="rounded-xl bg-muted/45 px-3 py-2">
                    Practice with the full mock series instead of a single sample.
                  </p>
                  <p className="rounded-xl bg-muted/45 px-3 py-2">
                    Use coding, PYQs and analytics together instead of in separate places.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border/80 bg-background/80 p-4">
                <p className="text-sm font-semibold">What changes after you upgrade</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {PLAN_FEATURES.slice(0, 6).map((row) => (
                    <div key={row.feature} className="rounded-xl bg-muted/45 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {row.feature}
                      </p>
                      <p className="mt-1 text-sm">{row.premium}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {renderSecondarySections ? (
            <PlanComparison premium={state.premium} />
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-sm text-muted-foreground">
              Loading feature comparison…
            </div>
          )}

        </CardContent>
      </Card>

      {renderSecondarySections && state.entitlementSource !== "creator" ? (
        <Card id="creator-invite">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base">
              <Icon name="KeyRound" className="size-4 text-primary" /> Creator invite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-3 sm:flex-row" onSubmit={redeemCreatorCode}>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="creator-code">Creator code</Label>
                <Input
                  id="creator-code"
                  value={creatorCode}
                  onChange={(event) => setCreatorCode(event.target.value.toUpperCase())}
                  placeholder="SB-XXXX-XXXX-XXXX"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={17}
                />
                <p className="text-xs text-muted-foreground">
                  Each invite works once and unlocks creator access for one year on this account.
                </p>
              </div>
              <Button
                type="submit"
                variant="outline"
                className="sm:mt-6"
                disabled={!creatorCode.trim() || redeemingCode}
              >
                {redeemingCode ? "Checking..." : "Redeem code"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {/* Target companies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-base">
            <Icon name="Target" className="size-4 text-primary" /> Target companies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Primary (your dashboard focus)</Label>
            <Select value={state.primary} onValueChange={(v) => setPrimary(v as CompanyId)}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(state.interested.length ? state.interested : (["general"] as CompanyId[])).map(
                  (id) => (
                    <SelectItem key={id} value={id}>
                      {getCompany(id).name}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm">Interested companies</Label>
            <div className="mt-2 space-y-2">
              {state.interested.length === 0 ? (
                <p className="text-sm text-muted-foreground">None yet - add some below.</p>
              ) : (
                state.interested.map((id) => (
                  <div
                    key={id}
                    className="flex items-center gap-3 rounded-xl border border-border p-2.5"
                  >
                    <CompanyAvatar id={id} size={32} />
                    <span className="flex-1 font-medium">{getCompany(id).name}</span>
                    {id === state.primary ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Primary
                      </span>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        removeInterested(id)
                        toast(`Removed ${getCompany(id).short}`, {
                          description: "Progress is kept if you add it back.",
                        })
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {available.length > 0 ? (
            <div>
              <Label className="text-sm">Add a company</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {available.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => tryAdd(c.id)}
                    className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
                  >
                    <CompanyAvatar id={c.id} size={20} /> {c.short}
                    <Icon name="ArrowRight" className="size-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>
              {!state.premium ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Free opens Section 1, Chapter 1. Premium unlocks every section and chapter.
                </p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Profile */}
      <ProfileEditor profile={state.profile} onSave={updateProfile} />

      {/* Notifications */}
      {renderSecondarySections ? <NotificationSettings /> : null}

      {/* Danger zone */}
      {renderSecondarySections ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="font-heading text-base text-destructive">Danger zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium">Reset progress</p>
                <p className="text-sm text-muted-foreground">
                  Clear all progress, XP, streaks and target companies. Your account stays.
                </p>
              </div>
              <Button
                variant="outline"
                className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  reset()
                  toast("All progress reset")
                }}
              >
                Reset everything
              </Button>
            </div>

            <div className="h-px bg-destructive/15" />

            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium">Delete account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all personal data. This cannot be undone.
                </p>
              </div>
              <DeleteAccountDialog onConfirm={deleteAccount} />
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

async function readApiJson<T extends { error?: string }>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return (await response.json()) as T
  }

  const body = await response.text()
  if (body.toLowerCase().includes("<!doctype") || body.toLowerCase().includes("<html")) {
    throw new Error(
      response.status === 401
        ? "Please sign in again before upgrading."
        : "The payment endpoint returned a web page instead of JSON. Check deployment environment variables and API routing.",
    )
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
      existing.addEventListener("error", () => reject(new Error("Razorpay checkout failed to load.")), {
        once: true,
      })
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



function DeleteAccountDialog({ onConfirm }: { onConfirm: () => Promise<void> }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [confirmText, setConfirmText] = React.useState("")
  const [deleting, setDeleting] = React.useState(false)
  const canDelete = confirmText.trim().toUpperCase() === "DELETE"

  async function handleDelete() {
    if (!canDelete || deleting) return
    setDeleting(true)
    try {
      await onConfirm()
      toast("Your account and data have been deleted.")
      router.replace("/")
    } catch {
      setDeleting(false)
      toast.error("Couldn't delete your account. Please try again or contact support.")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setConfirmText("")
      }}
    >
      <DialogTrigger asChild>
        <Button className="shrink-0" variant="destructive">
          Delete account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            This permanently erases your profile, progress, XP, streaks and subscription
            status. It cannot be undone. Type <strong>DELETE</strong> to confirm.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          aria-label="Type DELETE to confirm"
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={deleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" disabled={!canDelete || deleting} onClick={handleDelete}>
            {deleting ? (
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              "Delete permanently"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ProfileEditor({
  profile,
  onSave,
}: {
  profile: Profile
  onSave: (p: Partial<Profile>) => void
}) {
  const [draft, setDraft] = React.useState(profile)
  const fields: { key: keyof Profile; label: string }[] = [
    { key: "name", label: "Full name" },
    { key: "college", label: "College" },
    { key: "branch", label: "Branch" },
    { key: "gradYear", label: "Graduation year" },
    { key: "cgpa", label: "CGPA" },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-base">
          <Icon name="User" className="size-4 text-primary" /> Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label className="text-sm">{f.label}</Label>
              <Input
                value={draft[f.key]}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => {
              onSave(draft)
              toast.success("Profile saved")
            }}
          >
            Save changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const NOTIF_PREFS_KEY = "studybench.notifs.v1"
const LEGACY_NOTIF_PREFS_KEY = "placeready.notifs.v1"
const DEFAULT_NOTIF_PREFS = { daily: true, drive: true, reengage: false }
type NotifPrefs = typeof DEFAULT_NOTIF_PREFS

function PlanComparison({ premium }: { premium: boolean }) {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-border">
      <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-border bg-muted/45 px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
        <span>Feature</span>
        <span>Free</span>
        <span className="flex items-center gap-1 text-primary">
          <Icon name="Crown" className="size-3.5" /> Premium
        </span>
      </div>
      {PLAN_FEATURES.map((row) => (
        <div
          key={row.feature}
          className="grid grid-cols-[1.1fr_1fr_1fr] gap-2 border-b border-border px-3 py-2.5 text-sm last:border-b-0"
        >
          <span className="font-medium">{row.feature}</span>
          <span className="text-muted-foreground">{row.free}</span>
          <span className={premium ? "font-medium text-[color:var(--success)]" : "font-medium text-foreground"}>
            {row.premium}
          </span>
        </div>
      ))}
    </div>
  )
}

function NotificationSettings() {
  const [prefs, setPrefs] = React.useState<NotifPrefs>(() => {
    if (typeof window === "undefined") return DEFAULT_NOTIF_PREFS
    try {
      const raw = localStorage.getItem(NOTIF_PREFS_KEY) ?? localStorage.getItem(LEGACY_NOTIF_PREFS_KEY)
      if (!raw) return DEFAULT_NOTIF_PREFS
      if (!localStorage.getItem(NOTIF_PREFS_KEY)) {
        localStorage.setItem(NOTIF_PREFS_KEY, raw)
        localStorage.removeItem(LEGACY_NOTIF_PREFS_KEY)
      }
      return { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(raw) }
    } catch {
      return DEFAULT_NOTIF_PREFS
    }
  })

  function update(key: keyof NotifPrefs, value: boolean) {
    setPrefs((p: NotifPrefs) => {
      const next = { ...p, [key]: value }
      try {
        localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(next))
      } catch {
        /* quota / private mode */
      }
      return next
    })

    if (key === "reengage" && value) {
      void fetch("/api/email/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "StudyBench updates are enabled",
          message:
            "You will receive useful preparation updates, reminders and learning nudges when they are available.",
        }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Email update failed")
          toast.success("Email updates enabled")
        })
        .catch(() => {
          toast("Email updates saved", {
            description: "We could not send a confirmation email right now.",
          })
        })
    }
  }

  const items: { key: keyof NotifPrefs; label: string; desc: string }[] = [
    { key: "daily", label: "Daily challenge reminder", desc: "A nudge to keep your streak alive." },
    { key: "drive", label: "Drive-date countdown", desc: "Reminders as your drive approaches." },
    { key: "reengage", label: "Re-engagement emails", desc: "If you've been away for a while." },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-base">
          <Icon name="Bell" className="size-4 text-primary" /> Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((it) => (
          <div key={it.key} className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{it.label}</p>
              <p className="text-xs text-muted-foreground">{it.desc}</p>
            </div>
            <Switch
              checked={prefs[it.key]}
              onCheckedChange={(v) => update(it.key, v)}
            />
          </div>
        ))}
        <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          Your preferences are saved. Email &amp; push delivery roll out soon - until then these
          control what you&apos;ll receive at launch.
        </p>
      </CardContent>
    </Card>
  )
}


