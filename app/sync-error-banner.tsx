"use client"

import * as React from "react"
import { toast } from "sonner"
import { retryProgressSync } from "@/lib/supabase/progress-sync-queue"
import { useStoreSnapshot } from "@/lib/store"

/**
 * Invisible component that listens for Supabase sync failures and surfaces a
 * dismissible toast with a one-click retry. It stays subscribed to a stable
 * store snapshot so normal progress updates don't keep re-rendering it.
 */
export function SyncErrorBanner() {
  const store = useStoreSnapshot()

  React.useEffect(() => {
    function handler(event: Event) {
      const detail = (event as CustomEvent<{ label?: string; code?: string | null; message?: string; retryable?: boolean; queuedLocally?: boolean }>).detail
      const reason = [detail?.label, detail?.code, detail?.message].filter(Boolean).join(" · ")
      const queuedLocally = Boolean(detail?.queuedLocally)
      const retryable = detail?.retryable !== false
      toast.warning("Progress sync failed", {
        id: "sync-error",
        description: `${reason || "The server did not acknowledge your latest progress."}${queuedLocally ? retryable ? " Your latest snapshot is saved in this browser and will be retried." : " Your latest snapshot is saved in this browser. Automatic retries are paused because this is a permission or data error; retry after the issue is corrected." : " Local queue persistence could not be confirmed; keep this tab open and contact support if the issue continues."}`,
        action: {
          label: "Retry now",
          onClick: () => {
            const snapshot = store.getSnapshot()
            if (snapshot.userId) void retryProgressSync(snapshot.userId)
          },
        },
      })
    }

    window.addEventListener("studybench:sync-error", handler)
    return () => window.removeEventListener("studybench:sync-error", handler)
  }, [store])

  return null
}
