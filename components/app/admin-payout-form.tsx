"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function AdminPayoutForm({ userId }: { userId: string }) {
  const [transactionId, setTransactionId] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    const response = await fetch("/api/admin/affiliates/payout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, transactionId }),
    })
    const result = await response.json().catch(() => ({}))
    setLoading(false)
    if (!response.ok) {
      setMessage(result.error ?? "Could not record payout.")
      return
    }
    setMessage("Payout recorded. Refresh this page to see the updated balance.")
    setTransactionId("")
  }

  return <form onSubmit={submit} className="flex min-w-64 flex-col gap-2 sm:flex-row">
    <Input value={transactionId} onChange={(event) => setTransactionId(event.target.value)} placeholder="UPI transaction reference" maxLength={120} required disabled={loading} />
    <Button type="submit" size="sm" disabled={loading || transactionId.trim().length < 3}>{loading ? "Saving…" : "Record paid"}</Button>
    {message ? <p className="basis-full text-xs text-muted-foreground">{message}</p> : null}
  </form>
}
