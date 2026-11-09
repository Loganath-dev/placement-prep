"use client"

import * as React from "react"

// Catches errors thrown by the root layout itself (e.g. font/provider crashes),
// where app/error.tsx can't help because it renders inside that same layout.
// Must define its own <html>/<body> — there is no parent layout left to rely on.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("[global-error]", error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "grid",
            minHeight: "100svh",
            placeItems: "center",
            padding: "1rem",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          <div>
            <p style={{ fontSize: "1.125rem", fontWeight: 600 }}>Something went wrong</p>
            <p style={{ marginTop: "0.5rem", color: "#666" }}>
              StudyBench failed to load. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1.25rem",
                borderRadius: "0.5rem",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
