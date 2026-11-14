/**
 * Public identifiers for the StudyBench owner/admin navigation.
 * Privileged operations are still verified server-side in lib/admin.ts.
 */
export const OWNER_ADMIN_EMAILS = ["lnath6630@gmail.com"] as const

export function isConfiguredAdminEmail(email: string | null | undefined): boolean {
  const normalized = email?.trim().toLowerCase()
  return Boolean(normalized && OWNER_ADMIN_EMAILS.some((allowed) => allowed === normalized))
}
