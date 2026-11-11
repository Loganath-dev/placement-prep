/**
 * Defense-in-depth CSRF check for cookie-authenticated mutation routes.
 * Browser requests include Origin; reject cross-origin and Sec-Fetch-Site
 * cross-site mutations. Non-browser clients without Origin remain compatible
 * and must still authenticate normally.
 */
export function hasTrustedRequestOrigin(request: Request): boolean {
  const origin = request.headers.get("origin")
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) return false
    } catch {
      return false
    }
  }

  const fetchSite = request.headers.get("sec-fetch-site")
  if (fetchSite === "cross-site") return false
  return true
}
