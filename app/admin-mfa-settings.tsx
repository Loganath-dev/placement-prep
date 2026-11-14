"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

type TotpFactor = {
  id: string
  status: "verified" | "unverified"
}

export function AdminMfaSettings() {
  const supabase = createClient()
  const [factor, setFactor] = React.useState<TotpFactor | null>(null)
  const [qrCode, setQrCode] = React.useState<string | null>(null)
  const [secret, setSecret] = React.useState<string | null>(null)
  const [code, setCode] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [busy, setBusy] = React.useState(false)
  const [aal2, setAal2] = React.useState(false)

  const refreshFactors = React.useCallback(async () => {
    const [{ data: factors, error: factorsError }, { data: assurance }] = await Promise.all([
      supabase.auth.mfa.listFactors(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ])
    if (factorsError) throw factorsError
    const totp = (factors?.totp ?? []) as TotpFactor[]
    setFactor(totp.find((item) => item.status === "verified") ?? totp[0] ?? null)
    const hasAal2 = assurance?.currentLevel === "aal2"
    setAal2(hasAal2)
    if (hasAal2) {
      setQrCode(null)
      setSecret(null)
      setCode("")
    }
  }, [supabase])

  React.useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      void refreshFactors()
        .catch((error: unknown) => {
          if (active) toast.error(error instanceof Error ? error.message : "Could not load MFA settings.")
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 0)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [refreshFactors])

  async function startEnrollment() {
    setBusy(true)
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "StudyBench admin authenticator",
      })
      if (error) throw error
      setFactor({ id: data.id, status: "unverified" })
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      toast.success("Scan the QR code with your authenticator app.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start MFA setup.")
    } finally {
      setBusy(false)
    }
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!factor || !/^\d{6}$/.test(code)) {
      toast.error("Enter the six-digit code from your authenticator app.")
      return
    }
    setBusy(true)
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id })
      if (challengeError) throw challengeError
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challenge.id,
        code,
      })
      if (verifyError) throw verifyError
      await refreshFactors()
      toast.success("Authenticator verified. Admin access is now available for this session.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The authenticator code could not be verified.")
    } finally {
      setBusy(false)
    }
  }

  const verified = factor?.status === "verified"
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-base">Administrator security</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Affiliate management and other sensitive admin pages require a verified authenticator code.
        </p>
        {loading ? <p className="text-sm">Checking authenticator status…</p> : null}
        {!loading && !factor ? (
          <Button type="button" disabled={busy} onClick={() => void startEnrollment()}>
            Set up authenticator
          </Button>
        ) : null}
        {!loading && verified && aal2 ? (
          <Button asChild><Link href="/admin/referrals">Open affiliate management</Link></Button>
        ) : null}
        {qrCode ? (
          <div className="space-y-3 rounded-lg border bg-background p-4">
            <p className="text-sm font-medium">Scan this QR code with an authenticator app.</p>
            {/* Supabase returns an SVG data URL for its TOTP enrollment QR code. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCode} alt="Authenticator setup QR code" className="size-48 rounded bg-white p-2" />
            <p className="text-xs text-muted-foreground">If scanning fails, enter this setup key manually:</p>
            <code className="block break-all rounded bg-muted p-2 text-sm">{secret}</code>
          </div>
        ) : null}
        {!loading && factor && !aal2 ? (
          <form onSubmit={(event) => void verifyCode(event)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 space-y-1 text-sm font-medium">
              {verified ? "Verify authenticator for admin access" : "Enter the code to finish setup"}
              <Input
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit code"
                required
              />
            </label>
            <Button type="submit" disabled={busy || code.length !== 6}>
              {busy ? "Verifying…" : "Verify code"}
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  )
}
