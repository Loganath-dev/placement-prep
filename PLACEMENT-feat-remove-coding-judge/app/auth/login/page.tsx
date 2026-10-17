"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Icon } from "@/components/app/icon"
import { AuthShell, GoogleButton, OrDivider } from "@/components/app/auth-shared"
import { createClient } from "@/lib/supabase/client"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [needsConfirm, setNeedsConfirm] = React.useState(false)
  const [resent, setResent] = React.useState(false)
  const [error, setError] = React.useState<string | null>(
    searchParams.get("error")
      ? "That sign-in link could not be verified. Please sign in below, or request a new link."
      : null,
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNeedsConfirm(false)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) {
      // Supabase returns this when the account exists but the email isn't verified yet.
      if (/confirm/i.test(err.message)) {
        setNeedsConfirm(true)
        setError("Your email isn't confirmed yet. Resend the confirmation link below.")
      } else {
        setError(err.message)
      }
      return
    }
    // Continue to the requested app route; the store checks onboarding on hydration.
    const next = searchParams.get("next")
    const safeNext =
      next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"
    window.location.href = safeNext
  }

  async function resendConfirmation() {
    if (!email) {
      setError("Enter your email above first, then resend.")
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setResent(true)
    setError(null)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <GoogleButton label="Sign in with Google" source="login" />
      <div className="my-4">
        <OrDivider />
      </div>
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
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="Your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {resent ? (
          <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-[color:var(--success)]">
            Confirmation link sent. Check your inbox, then sign in.
          </p>
        ) : null}
        {needsConfirm ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={loading}
            onClick={resendConfirmation}
          >
            Resend confirmation email
          </Button>
        ) : null}
        {needsConfirm ? (
          <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            If the mail takes a minute to arrive, check spam once. Then come back
            here and sign in without starting over.
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <>
              Sign in <Icon name="ArrowRight" className="size-4" />
            </>
          )}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        New to StudyBench?{" "}
        <Link href="/auth/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Pick up where you left off."
    >
      <React.Suspense>
        <LoginForm />
      </React.Suspense>
    </AuthShell>
  )
}


