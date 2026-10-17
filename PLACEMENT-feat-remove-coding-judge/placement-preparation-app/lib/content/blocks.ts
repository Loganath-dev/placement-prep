/** Shared rich-content block type used by blogs and other marketing pages. */
export type ContentBlock =
  | { k: "p"; text: string }
  | { k: "sub"; text: string }
  | { k: "list"; items: string[] }
  | { k: "ol"; items: string[] }
  | { k: "quote"; text: string }

/** Site constants for SEO/AEO metadata and JSON-LD. */
// NOTE: must match the host the site actually serves on. Vercel 308-redirects
// the apex domain to www, so canonicals/sitemap/OG/JSON-LD all use www —
// pointing them at the apex would make every SEO signal go through a redirect.
export const SITE_URL = "https://www.studybench.in"
export const SITE_NAME = "StudyBench"
export const SITE_TAGLINE = "Campus placement preparation for Indian students"

