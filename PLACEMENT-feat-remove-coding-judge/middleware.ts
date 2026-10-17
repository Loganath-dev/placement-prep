import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const { pathname } = request.nextUrl

  // These routes never need session-aware redirects. Avoid a Supabase network
  // call entirely so articles, legal pages, SEO assets and APIs start faster.
  const sessionAgnosticPublicRoute =
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/faq" ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname.startsWith("/api/") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/icon" ||
    pathname === "/apple-icon" ||
    pathname === "/opengraph-image" ||
    pathname === "/manifest.webmanifest"

  if (sessionAgnosticPublicRoute) return supabaseResponse

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh session — do NOT add logic between createServerClient and getUser.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublic =
    pathname === "/" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/faq" ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname.startsWith("/api/") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    // Brand/meta assets must stay public: social crawlers (WhatsApp, LinkedIn,
    // Google) fetch these without cookies and must never hit the login redirect.
    pathname === "/icon" ||
    pathname === "/apple-icon" ||
    pathname === "/opengraph-image" ||
    pathname === "/manifest.webmanifest" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")

  if (!user && !isPublic) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/auth/login"
    loginUrl.search = "" // drop any existing query before setting `next`
    // Preserve where the user was headed so we can return them there post-login.
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // Signed-in users skip the marketing landing and auth entry pages and go
  // straight to their dashboard. Honour a same-origin `next` param if present.
  // (Deliberately NOT applied to /auth/callback or /auth/reset-password — the
  // OAuth/recovery flows must run even with an active session.)
  if (user && (pathname === "/" || pathname === "/auth/login" || pathname === "/auth/signup")) {
    const next = request.nextUrl.searchParams.get("next")
    // Same-origin paths only ("//host" would be a protocol-relative open redirect).
    const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"
    return NextResponse.redirect(new URL(safeNext, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
