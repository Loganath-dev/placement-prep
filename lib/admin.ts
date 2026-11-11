// SERVER-ONLY. Privileged access comes from trusted Auth app_metadata or
// server-side email allowlists. User-editable user_metadata is never trusted.
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isCreatorEmail } from "@/lib/creators"

function configuredAdmins(): Set<string> {
  return new Set((process.env.STUDYBENCH_ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean))
}

export function isAdminUser(
  user: { email?: string | null; email_confirmed_at?: string | null; app_metadata?: Record<string, unknown> } | null | undefined,
): boolean {
  if (!user?.email_confirmed_at) return false
  if (user.app_metadata?.role === "admin") return true
  const email = user.email?.trim().toLowerCase()
  return Boolean(email && (configuredAdmins().has(email) || isCreatorEmail(email)))
}

/** Compatibility helper for server-rendered navigation and admin guards. */
export function isAdminEmail(email: string | null | undefined): boolean {
  const normalized = email?.trim().toLowerCase()
  return Boolean(normalized && (configuredAdmins().has(normalized) || isCreatorEmail(normalized)))
}

export const ADMIN_EMAILS = ["lnath6630@gmail.com", "studybench07@gmail.com"] as const

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) redirect("/dashboard")

  // Admin actions require a phishing-resistant second factor assurance level.
  const { data: assurance, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (error || assurance?.currentLevel !== "aal2") redirect("/settings?security=mfa-required")
  return user!
}
