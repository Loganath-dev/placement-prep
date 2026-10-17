"use client"

import { useRouter } from "next/navigation"
import * as React from "react"
import { AppSidebar, AppTopbar } from "@/components/app/nav"
import { SyncErrorBanner } from "@/components/app/sync-error-banner"
import { StudyTimer } from "@/components/app/study-timer"
import { OnboardingModal } from "@/components/app/onboarding-modal"
import { useStoreSelector } from "@/lib/store"

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrated = useStoreSelector((store) => store.hydrated)
  const onboarded = useStoreSelector((store) => store.state.onboarded)
  const userId = useStoreSelector((store) => store.userId)
  const router = useRouter()

  React.useEffect(() => {
    // Wait until Supabase hydration finishes (`userId` set) so `onboarded`
    // reflects DB truth — not a stale localStorage entry from sign-out.
    if (hydrated && !onboarded && userId) router.replace("/onboarding")
  }, [hydrated, onboarded, userId, router])

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

  if (!onboarded) return null

  return (
    <div className="flex min-h-svh bg-background">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-background px-4 py-2 text-sm font-semibold text-foreground shadow focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <SyncErrorBanner />
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar />
        <main
          id="main-content"
          className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 md:px-7 md:py-10"
        >
          {children}
        </main>
      </div>
      <StudyTimer />
      <OnboardingModal />
    </div>
  )
}
