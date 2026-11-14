"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/app-icon"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("[admin-route-error]", error)
  }, [error])

  return (
    <div className="grid min-h-[55vh] place-items-center">
      <Card className="w-full max-w-lg border-destructive/20">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <Icon name="AlertTriangle" className="size-7" />
          </span>
          <div>
            <h1 className="font-heading text-lg font-semibold">Admin data could not be loaded</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              No changes were made. Please try again. If the problem continues, contact the platform administrator.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={reset}><Icon name="RefreshCw" className="size-4" /> Retry</Button>
            <Button asChild variant="outline"><Link href="/admin">Admin overview</Link></Button>
            <Button asChild variant="ghost"><Link href="/dashboard">Student dashboard</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
