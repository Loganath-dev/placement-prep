// SERVER-ONLY. Admin access is checked against server-owned identity and MFA.
// User-editable user_metadata is intentionally never consulted.

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CREATOR_EMAILS, isCreatorEmail } from "@/lib/creators"

export const ADMIN_EMAILS = CREATOR_EMAILS

export function isAdminEmail(email: string | null | undefined): boolean {
  return isCreatorEmail(email)
}

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) redirect("/dashboard")

  // Admin actions require an enrolled and verified second factor.
  const { data: assurance, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (error || assurance?.currentLevel !== "aal2") {
    redirect("/settings?security=mfa-required")
  }
  return user
}
