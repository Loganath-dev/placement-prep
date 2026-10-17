"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"

export default function AppSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("[app-error]", error)
  }, [error])

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Card className="max-w-md border-destructive/20">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <Icon name="AlertTriangle" className="size-7" />
          </span>
          <div>
            <p className="font-heading text-lg font-semibold">Something went wrong</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This page hit a snag. Your progress is saved — try again, or head back to your
              dashboard.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset}>
              <Icon name="RefreshCw" className="size-4" /> Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
