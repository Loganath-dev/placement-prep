"use client"

import * as React from "react"
import Link from "next/link"
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
import { Icon } from "@/components/app-icon"
import { PageHeader } from "@/app/page-header"
import { CompanyAvatar } from "@/app/ui-bits"
import {
  PLAN_FEATURES,
  PREMIUM_ANNUAL_PRICE_INR,
  PREMIUM_SIX_MONTH_PRICE_INR,
} from "@/lib/access"
import { SELECTABLE_COMPANIES, getCompany } from "@/lib/data/companies"
import { useStore } from "@/lib/store"
import type { CompanyId } from "@/lib/types"
import { PROGRAMMING_PATHS } from "@/lib/data/programming-paths"
import { isConfiguredAdminEmail } from "@/lib/admin-config"
import { AdminMfaSettings } from "@/app/admin-mfa-settings"
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client"

export default function SettingsPage() {
  const {
    state,
    userId,
    activatePremium,
    setPrimary,
    addInterested,
    removeInterested,
    updateLearningPreferences,
    reset,
    deleteAccount,
  } = useStore()

  type SelectableCompanyId = Exclude<CompanyId, "general">
  const visibleInterested = state.interested.filter(
    (id): id is SelectableCompanyId => id !== "general",
  )
  const selectedLanguages = state.learningPreferences?.selectedLanguages?.length
    ? state.learningPreferences.selectedLanguages
    : ["lang-python"]
  function toggleLanguage(languageId: string) {
    const next = selectedLanguages.includes(languageId)
      ? selectedLanguages.filter((id) => id !== languageId)
      : [...selectedLanguages, languageId]
    if (!next.length) {
      toast.error("Choose at least one programming language.")
      return
    }
    updateLearningPreferences({
      focusArea: state.learningPreferences?.focusArea ?? "programming",
      confidence: state.learningPreferences?.confidence ?? "starting",
      dailyMinutes: state.learningPreferences?.dailyMinutes ?? 20,
      selectedLanguages: next,
    })
    toast.success("Programming preferences updated")
  }
  const available = SELECTABLE_COMPANIES.filter(
    (company): company is (typeof SELECTABLE_COMPANIES)[number] & { id: SelectableCompanyId } =>
      company.id !== "general" && !visibleInterested.includes(company.id),
  )
  const [creatorCode, setCreatorCode] = React.useState("")
  const [redeemingCode, setRedeemingCode] = React.useState(false)
  const [renderSecondarySections, setRenderSecondarySections] = React.useState(false)
  const [isOwnerAdmin, setIsOwnerAdmin] = React.useState(false)
  const activeUntil = state.premiumUntil ?? null

  React.useEffect(() => {
    const id = window.setTimeout(() => setRenderSecondarySections(true), 0)
    return () => window.clearTimeout(id)
  }, [])

  React.useEffect(() => {
    let active = true
    void (async () => {
      const { data } = await createSupabaseBrowserClient().auth.getUser()
      if (active) setIsOwnerAdmin(isConfiguredAdminEmail(data.user?.email))
    })()
    return () => { active = false }
  }, [])

  function tryAdd(id: CompanyId) {
    addInterested(id)
    toast.success(`Added ${getCompany(id).short}`)
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
        description="Subscription, target companies and account preferences."
      />

      {isOwnerAdmin ? <AdminMfaSettings /> : null}

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-base">
            <Icon name="Code2" className="size-4 text-primary" /> Programming languages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Choose the language roadmaps shown on your dashboard and learning page.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PROGRAMMING_PATHS.filter((path) => path.kind === "language").map((path) => {
              const selected = selectedLanguages.includes(path.id)
              return (
                <label key={path.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/40">
                  <input type="checkbox" checked={selected} onChange={() => toggleLanguage(path.id)} className="size-4 accent-primary" />
                  <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{path.name}</span><span className="block text-xs text-muted-foreground">{path.short}</span></span>
                  {selected ? <Icon name="CheckCircle2" className="size-4 text-primary" /> : null}
                </label>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground">Changes are saved to your account automatically.</p>
        </CardContent>
      </Card>

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
                All learning chapters, company tracks, full PYQs and mock assessments are unlocked.
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
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 sm:flex-row sm:items-center">
              <div>
                <p className="font-heading text-lg font-semibold">Choose your Premium duration</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  6 months for ₹{PREMIUM_SIX_MONTH_PRICE_INR} or 1 year for ₹{PREMIUM_ANNUAL_PRICE_INR}. Both plans unlock full access.
                </p>
              </div>
              <Button asChild className="shrink-0">
                <Link href="/pricing">Compare plans <Icon name="ArrowRight" className="ml-2 size-4" /></Link>
              </Button>
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
            <Select value={state.primary !== "general" && visibleInterested.includes(state.primary) ? state.primary : visibleInterested[0] ?? "tcs"} onValueChange={(v) => setPrimary(v as CompanyId)}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(visibleInterested.length ? visibleInterested : (["tcs"] as CompanyId[])).map(
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
              {visibleInterested.length === 0 ? (
                <p className="text-sm text-muted-foreground">None yet - add some below.</p>
              ) : (
                visibleInterested.map((id) => (
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
        : "The payment service is temporarily unavailable. Please try again later.",
    )
  }

  throw new Error(body.trim() || fallbackMessage)
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
            This permanently erases your account data, progress, XP, streaks and subscription
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


