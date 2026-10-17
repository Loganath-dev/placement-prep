import type { NextConfig } from "next"

const isProd = process.env.NODE_ENV === "production"

// Supabase project origin (REST + Realtime). Falls back to a wildcard so the
// CSP still works if the env var isn't set at build time.
const supabaseOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
      : "https://*.supabase.co"
  } catch {
    return "https://*.supabase.co"
  }
})()

const supabaseWs = supabaseOrigin.replace(/^https/, "wss")

// Content-Security-Policy. 'unsafe-inline' is required for Next's hydration
// inline scripts and for React inline style attributes; 'unsafe-eval' is only
// allowed in dev (HMR needs it). Tighten with nonces once a CSP nonce middleware
// is in place.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `script-src 'self' 'unsafe-inline' https://checkout.razorpay.com${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  `connect-src 'self' ${supabaseOrigin} ${supabaseWs} https://api.razorpay.com`,
  "form-action 'self'",
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
]

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  // output: "standalone" is required by @opennextjs/cloudflare but breaks Vercel.
  // Enable it only during Cloudflare Pages builds (CF_PAGES is set automatically).
  ...(process.env.CF_PAGES ? { output: "standalone" } : {}),
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default nextConfig
