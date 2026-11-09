/**
 * Founder/operator identities. This list is intentionally server-owned: it is
 * used to derive privileged access and must never be accepted from client input.
 */
export const CREATOR_EMAILS = ["lnath6630@gmail.com", "studybench07@gmail.com"] as const

export function isCreatorEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const normalized = email.trim().toLowerCase()
  return CREATOR_EMAILS.some((creatorEmail) => creatorEmail === normalized)
}
