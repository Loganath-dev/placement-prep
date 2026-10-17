"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icon } from "@/components/app/icon"
import { AuthShell } from "@/components/app/auth-shared"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sent, setSent] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle={`We sent a reset link to ${email}.`}>
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <span className="grid size-14 place-items-center rounded-2xl bg-success/10 text-[color:var(--success)]">
            <Icon name="MailCheck" className="size-7" />
          </span>
          <p className="text-sm text-muted-foreground">
            Click the link to choose a new password. The link expires in 1 hour.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Back to sign in</Link>
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send a reset link."
    >
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
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
                Send reset link <Icon name="ArrowRight" className="size-4" />
              </>
            )}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}


