// SERVER-ONLY. Single source of truth for who can reach admin surfaces.
//
// Admin access is an email allowlist checked server-side in each admin page.
// Kept here (not duplicated per page) so adding/removing an admin is one edit.

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CREATOR_EMAILS, isCreatorEmail } from "@/lib/creators"

/** Founder / operator emails allowed into /admin/*. */
export const ADMIN_EMAILS = CREATOR_EMAILS

export function isAdminEmail(email: string | null | undefined): boolean {
  return isCreatorEmail(email)
}

/**
 * Server gate for admin pages: returns the admin user, or redirects to the
 * dashboard when the caller is not signed in or not an admin. Call at the top
 * of an admin server component.
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminEmail(user?.email)) {
    redirect("/dashboard")
  }
  return user!
}
