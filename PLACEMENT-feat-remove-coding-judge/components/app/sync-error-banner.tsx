"use client"

import * as React from "react"
import { toast } from "sonner"
import { syncAll } from "@/lib/supabase/db"
import { useStoreSnapshot } from "@/lib/store"

/**
 * Invisible component that listens for Supabase sync failures and surfaces a
 * dismissible toast with a one-click retry. It stays subscribed to a stable
 * store snapshot so normal progress updates don't keep re-rendering it.
 */
export function SyncErrorBanner() {
  const store = useStoreSnapshot()

  React.useEffect(() => {
    function handler() {
      toast.warning("Sync failed - changes saved locally", {
        id: "sync-error",
        description: "Your progress is safe. We'll retry on the next action.",
        action: {
          label: "Retry now",
          onClick: () => {
            const snapshot = store.getSnapshot()
            if (snapshot.userId) syncAll(snapshot.userId, snapshot.state)
          },
        },
      })
    }

    window.addEventListener("studybench:sync-error", handler)
    return () => window.removeEventListener("studybench:sync-error", handler)
  }, [store])

  return null
}
