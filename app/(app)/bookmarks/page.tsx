"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/app/empty-state"
import { Icon } from "@/components/app-icon"
import { PageHeader } from "@/app/page-header"
import { removeBookmark, useBookmarks } from "@/lib/bookmarks"
import { useStore } from "@/lib/store"
import type { CompanyId } from "@/lib/types"

export default function BookmarksPage() {
  const items = useBookmarks()
  const { state, toggleLearningBookmark } = useStore()
  const savedCards = Object.entries(state.progress).flatMap(([companyId, company]) =>
    Object.entries(company.chapters).flatMap(([chapterId, chapter]) =>
      (chapter.learning?.savedCards ?? []).map((card) => ({ ...card, companyId: companyId as CompanyId, chapterId })),
    ),
  )

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Saved" title="Bookmarks" description="Your saved lesson cards, interview questions and PYQs." />
      {items.length === 0 && savedCards.length === 0 ? (
        <Card><EmptyState icon="Bookmark" title="No bookmarks yet" description="Save a learning card or question to find it here." /></Card>
      ) : (
        <div className="space-y-6">
          {savedCards.length ? (
            <section className="space-y-2" aria-labelledby="saved-learning-cards">
              <h2 id="saved-learning-cards" className="font-heading text-lg font-semibold">Saved learning cards</h2>
              {savedCards.map((card) => (
                <div key={`${card.companyId}:${card.chapterId}:${card.id}`} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon name="Layers" className="size-4" /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{card.title}</p><p className="text-xs capitalize text-muted-foreground">{card.companyId} · lesson card</p></div>
                  <Link href={card.href} className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted/50">Open</Link>
                  <button type="button" onClick={() => toggleLearningBookmark(card.companyId, card.chapterId, card)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground" aria-label={`Remove ${card.title} from saved cards`}><Icon name="X" className="size-4" /></button>
                </div>
              ))}
            </section>
          ) : null}
          {items.length ? (
            <section className="space-y-2" aria-labelledby="other-bookmarks">
              <h2 id="other-bookmarks" className="font-heading text-lg font-semibold">Other bookmarks</h2>
              {items.map((bm) => (
                <div key={bm.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon name={bm.type === "lesson" ? "BookOpen" : bm.type === "interview" ? "Mic" : "FileText"} className="size-4" /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{bm.title}</p>{bm.company ? <p className="text-xs capitalize text-muted-foreground">{bm.company}</p> : null}</div>
                  <Link href={bm.href} className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted/50">Open</Link>
                  <button type="button" onClick={() => removeBookmark(bm.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground" aria-label={`Remove ${bm.title} bookmark`}><Icon name="X" className="size-4" /></button>
                </div>
              ))}
            </section>
          ) : null}
        </div>
      )}
    </div>
  )
}
