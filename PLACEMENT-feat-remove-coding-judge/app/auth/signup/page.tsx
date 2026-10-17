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
import { track } from "@/lib/analytics"
import { createClient } from "@/lib/supabase/client"

const MIN_PASSWORD = 6

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sent, setSent] = React.useState(false)


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`)
      return
    }
    setLoading(true)
    setError(null)
    track("marketing_cta_click", { placement: "signup_form_submit" })
    const supabase = createClient()
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    track("signup", {
      method: "email",
      email_confirmation_required: !Boolean(data.session),
    })
    // If email confirmation is off, a session is returned and the user enters the app.
    if (data.session) {
      router.push("/onboarding")
      router.refresh()
    } else {
      // Email confirmation is on, so ask the user to verify.
      setSent(true)
    }
  }

  if (sent) {
    return (
      <AuthShell title="Confirm your email" subtitle={`We sent a confirmation link to ${email}.`}>
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <span className="grid size-14 place-items-center rounded-2xl bg-success/10 text-[color:var(--success)]">
            <Icon name="MailCheck" className="size-7" />
          </span>
          <p className="text-sm text-muted-foreground">
            Click the link in your inbox to activate your account, then sign in.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Go to sign in</Link>
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create your account" subtitle="It takes a minute to set up your prep route.">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <GoogleButton label="Sign up with Google" source="signup" />
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
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              placeholder={`At least ${MIN_PASSWORD} characters`}
              required
              minLength={MIN_PASSWORD}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                Create account <Icon name="ArrowRight" className="size-4" />
              </>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
