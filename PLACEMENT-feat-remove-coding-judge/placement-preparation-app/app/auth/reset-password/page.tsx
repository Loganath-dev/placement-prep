"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Icon } from "@/components/app/icon"
import { AuthShell } from "@/components/app/auth-shared"
import { createClient } from "@/lib/supabase/client"

const MIN_PASSWORD = 6

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [done, setDone] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`)
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setDone(true)
    setTimeout(() => {
      router.push("/dashboard")
      router.refresh()
    }, 1200)
  }

  if (done) {
    return (
      <AuthShell title="Password updated" subtitle="Taking you to your dashboard...">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <span className="grid size-14 place-items-center rounded-2xl bg-success/10 text-[color:var(--success)]">
            <Icon name="CircleCheckBig" className="size-7" />
          </span>
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password you'll remember.">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <PasswordInput
              id="password"
              placeholder={`At least ${MIN_PASSWORD} characters`}
              required
              minLength={MIN_PASSWORD}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <PasswordInput
              id="confirm"
              placeholder="Re-enter password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <>
                Update password <Icon name="KeyRound" className="size-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </AuthShell>
  )
}


