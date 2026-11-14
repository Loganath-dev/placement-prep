/** Resolve a user-supplied redirect to a same-origin absolute-path reference. */
export function safeInternalRedirectPath(
  raw: string | null | undefined,
  origin: string,
  fallback = "/dashboard",
): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return fallback
  }

  try {
    const target = new URL(raw, origin)
    if (target.origin !== new URL(origin).origin) return fallback
    return `${target.pathname}${target.search}${target.hash}`
  } catch {
    return fallback
  }
}
