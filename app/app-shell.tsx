"use client"

import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import { AdminSidebar, AdminTopbar, AppSidebar, AppTopbar, MobileBottomNav } from "@/app/nav"
import { SyncErrorBanner } from "@/app/sync-error-banner"
import { CommandPalette } from "@/app/command-palette"
import { StudyTimer } from "@/app/study-timer"
import { useStoreSelector } from "@/lib/store"

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrated = useStoreSelector((store) => store.hydrated)
  const onboarded = useStoreSelector((store) => store.state.onboarded)
  const userId = useStoreSelector((store) => store.userId)
  const router = useRouter()
  const pathname = usePathname()
  const isAdminArea = pathname.startsWith("/admin")

  React.useEffect(() => {
    if (!hydrated || onboarded || pathname === "/onboarding" || isAdminArea) return
    // Route stale or first-run local state somewhere visible instead of leaving
    // the authenticated shell blank while Supabase session hydration completes.
    router.replace(userId ? "/onboarding" : "/auth/login")
  }, [hydrated, onboarded, userId, pathname, router, isAdminArea])

  if (!hydrated) {
    return (
      <div className="grid min-h-svh place-items-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <span className="h-1.5 w-28 overflow-hidden rounded-sm bg-muted">
            <span className="block h-full w-1/2 animate-pulse rounded-sm bg-primary" />
          </span>
          <p className="text-sm">Loading StudyBench...</p>
        </div>
      </div>
    )
  }

  // The onboarding page shares this route-group layout, so it must remain
  // visible while the user completes setup. Other routes show the loader until
  // the redirect above takes effect.
  if (!onboarded && pathname !== "/onboarding" && !isAdminArea) {
    return (
      <div className="grid min-h-svh place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Opening your account...</p>
      </div>
    )
  }

  return (
    <div className="sb-app-shell flex min-h-svh bg-background">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-background px-4 py-2 text-sm font-semibold text-foreground shadow focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      {!isAdminArea ? <SyncErrorBanner /> : null}
      {isAdminArea ? <AdminSidebar /> : <AppSidebar />}
      <div className="flex min-w-0 flex-1 flex-col">
        {isAdminArea ? <AdminTopbar /> : <AppTopbar />}
        <main
          id="main-content"
          className="sb-page-content mx-auto w-full max-w-7xl flex-1 px-4 py-7 md:px-7 md:py-10"
        >
          {children}
        </main>
      </div>
      {!isAdminArea ? <StudyTimer /> : null}
      {!isAdminArea ? <MobileBottomNav /> : null}
      {!isAdminArea ? <CommandPalette /> : null}
    </div>
  )
}
