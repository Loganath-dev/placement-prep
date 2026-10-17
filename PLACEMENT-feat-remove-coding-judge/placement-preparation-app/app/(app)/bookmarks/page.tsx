"use client"

import Link from "next/link"
import * as React from "react"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/app/empty-state"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { removeBookmark, useBookmarks } from "@/lib/bookmarks"

export default function BookmarksPage() {
  // External store hook — re-renders automatically when a bookmark is removed.
  const items = useBookmarks()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Saved"
        title="Bookmarks"
        description="Lessons, interview questions and PYQs you saved for quick re-read."
      />

      {items.length === 0 ? (
        <Card>
          <EmptyState
            icon="Bookmark"
            title="No bookmarks yet"
            description="While reading a lesson or interview answer, tap the bookmark icon to save it here for quick re-read."
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((bm) => (
            <div
              key={bm.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon
                  name={
                    bm.type === "lesson"
                      ? "BookOpen"
                      : bm.type === "interview"
                        ? "Mic"
                        : "FileText"
                  }
                  className="size-4"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">{bm.title}</p>
                {bm.company ? (
                  <p className="text-xs text-muted-foreground capitalize">{bm.company}</p>
                ) : null}
              </div>
              <Link
                href={bm.href}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Open
              </Link>
              <button
                type="button"
                onClick={() => removeBookmark(bm.id)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                aria-label="Remove bookmark"
              >
                <Icon name="X" className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
