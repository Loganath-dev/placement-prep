"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { track } from "@/lib/analytics"
import { SITE_NAME, SITE_URL } from "@/lib/content/blocks"
import { priBand } from "@/lib/scoring"

function buildShareText(pri: number, companyShort: string) {
  const band = priBand(pri)
  return `My ${companyShort} placement readiness is ${pri}/100 (${band.label}) on ${SITE_NAME}. Track yours free: ${SITE_URL}`
}

function buildInviteUrl(userId: string) {
  const token = btoa(userId).replace(/=/g, "")
  return `${SITE_URL}/invite?ref=${token}`
}

async function shareOrCopy(text: string, fallbackToast: string) {
  if (typeof navigator === "undefined") return
  if (navigator.share) {
    try {
      await navigator.share({ text })
      return
    } catch {
      // User cancelled share — fall through to clipboard.
    }
  }
  await navigator.clipboard.writeText(text).catch(() => {})
  toast.success(fallbackToast)
}

export function SharePriCard({
  pri,
  companyShort,
  userId,
}: {
  pri: number
  companyShort: string
  userId: string | null
}) {
  const [copyingInvite, setCopyingInvite] = React.useState(false)
  const shareText = buildShareText(pri, companyShort)
  const inviteUrl = userId ? buildInviteUrl(userId) : null

  async function handleSharePri() {
    track("share_pri", { pri, company: companyShort })
    await shareOrCopy(shareText, "Score copied to clipboard")
  }

  async function handleCopyInvite() {
    if (!inviteUrl) return
    setCopyingInvite(true)
    track("invite_click", {})
    await shareOrCopy(inviteUrl, "Invite link copied to clipboard")
    await new Promise((r) => setTimeout(r, 1500))
    setCopyingInvite(false)
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Icon name="Share2" className="size-4 text-primary" />
          <p className="font-heading font-semibold">Share your progress</p>
        </div>

        {/* Score share row */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Your {companyShort} readiness</p>
            <p className="font-heading text-xl font-bold tabular-nums">{pri}/100</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSharePri}>
            <Icon name="Share2" className="size-4" /> Share score
          </Button>
        </div>

        {/* Invite link */}
        {inviteUrl ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Invite a friend — they start with a welcome boost on their first login.
            </p>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                {inviteUrl}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyInvite}
                disabled={copyingInvite}
              >
                {copyingInvite ? (
                  <Icon name="Check" className="size-4 text-[color:var(--success)]" />
                ) : (
                  <Icon name="Copy" className="size-4" />
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
