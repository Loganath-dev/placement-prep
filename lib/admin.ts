// SERVER-ONLY. This deployment has one administrator: the configured owner email.
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isConfiguredAdminEmail } from "@/lib/admin-config"

export function isAdminUser(user: {
  email?: string | null
  email_confirmed_at?: string | null
} | null | undefined): boolean {
  if (!user?.email_confirmed_at) return false
  return isConfiguredAdminEmail(user.email)
}

/** Verifies the signed-in identity and grants access to the admin overview. */
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) redirect("/dashboard")
  return user!
}

/** Use for sensitive admin work: financial data/actions and content publication. */
export async function requireAdminMfa() {
  const user = await requireAdmin()
  const supabase = await createClient()
  const { data: assurance, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (error || assurance?.currentLevel !== "aal2") {
    redirect("/settings?security=mfa-required")
  }
  return user
}
