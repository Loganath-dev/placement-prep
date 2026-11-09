"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/app/icon"

export default function RootSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("[root-error]", error)
  }, [error])

  return (
    <div className="grid min-h-svh place-items-center px-4">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <Icon name="AlertTriangle" className="size-7" />
        </span>
        <div>
          <p className="font-heading text-lg font-semibold">Something went wrong</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This page failed to load. Try again, or go back to the homepage.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset}>
            <Icon name="RefreshCw" className="size-4" /> Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
