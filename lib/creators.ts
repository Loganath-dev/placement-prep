// Creator access must come from trusted Auth app_metadata or a server-only
// environment allowlist. Never grant privileges from user_metadata.
function configuredCreators(): Set<string> {
  return new Set((process.env.STUDYBENCH_CREATOR_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean))
}

export function isCreatorUser(user: { email?: string | null; email_confirmed_at?: string | null; app_metadata?: Record<string, unknown> } | null | undefined): boolean {
  if (!user?.email_confirmed_at) return false
  if (user.app_metadata?.role === "creator" || user.app_metadata?.role === "admin") return true
  const email = user.email?.trim().toLowerCase()
  return Boolean(email && configuredCreators().has(email))
}
