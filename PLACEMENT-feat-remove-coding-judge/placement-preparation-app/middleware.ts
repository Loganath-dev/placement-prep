import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const { pathname } = request.nextUrl

  // These routes never need session-aware redirects. Avoid a Supabase network
  // call entirely so articles, legal pages, SEO assets and APIs start faster.
  const sessionAgnosticPublicRoute =
    pathname === "/invite" ||
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

  // Auth pages and callback endpoints must remain renderable even when the
  // Supabase session endpoint is unavailable. They perform their own checks.
  if (sessionAgnosticPublicRoute || pathname.startsWith("/auth/")) {
    return supabaseResponse
  }

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
  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.warn("[proxy] Supabase session lookup failed; treating request as signed out.")
    } else {
      user = data.user
    }
  } catch {
    // A temporary Supabase/network failure should not produce an empty page.
    // Protected requests fall through to the normal sign-in redirect below.
    console.warn("[proxy] Supabase session lookup failed; treating request as signed out.")
  }

  const isPublic =
    pathname === "/" ||
    pathname === "/invite" ||
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
    pathname === "/manifest.webmanifest" ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")

  if (!user && !isPublic) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/auth/login"
    loginUrl.search = ""
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  if (user && (pathname === "/" || pathname === "/auth/login" || pathname === "/auth/signup")) {
    const next = request.nextUrl.searchParams.get("next")
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
