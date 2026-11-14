"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/app-icon"
import { Prose } from "@/app/prose"
import type { LearningCard } from "@/lib/types"

function cardLabel(card: LearningCard): string {
  if (card.type === "worked-example") return "Worked example"
  if (card.type === "application") return "Shortcuts & traps"
  return "Understanding"
}

export function FlashcardStudySession({
  cards,
  index,
  completedIds,
  saved,
  onNavigate,
  onComplete,
  onStartPractice,
  practiceError,
  practiceDisabled = false,
  onToggleSave,
}: {
  cards: LearningCard[]
  index: number
  completedIds: ReadonlySet<string>
  saved: boolean
  onNavigate: (next: number) => void
  onComplete: (cardId: string) => Promise<boolean>
  onStartPractice: () => void
  practiceError: string | null
  practiceDisabled?: boolean
  onToggleSave: () => void
}) {
  const card = cards[index]
  const [completing, setCompleting] = React.useState(false)
  if (!card) return null
  const isCompleted = completedIds.has(card.id)

  const completeAndContinue = async (nextIndex?: number) => {
    if (completing) return
    setCompleting(true)
    try {
      const saved = isCompleted || await onComplete(card.id)
      if (saved && typeof nextIndex === "number") onNavigate(nextIndex)
    } finally {
      setCompleting(false)
    }
  }

  const isLastCard = index === cards.length - 1
  const allCardsCompleted = cards.length > 0 && completedIds.size === cards.length
  const progressPercent = cards.length ? Math.round((completedIds.size / cards.length) * 100) : 0

  return (
    <section className="space-y-4" aria-label="Chapter learning cards">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium">Learn</span>
          <span className="tabular-nums text-muted-foreground">{index + 1} of {cards.length} · {completedIds.size} completed</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Learning card completion" aria-valuenow={completedIds.size} aria-valuemin={0} aria-valuemax={cards.length}>
          <div className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background">{cardLabel(card)}</span>
        <Button type="button" size="sm" variant={saved ? "secondary" : "ghost"} aria-pressed={saved} aria-label={saved ? "Remove saved card" : "Save card"} onClick={onToggleSave}>
          <Icon name="Bookmark" className={`size-4 ${saved ? "fill-current" : ""}`} />
        </Button>
      </div>

      <article className="flex min-h-[27rem] flex-col rounded-3xl border border-teal-200 bg-emerald-50/70 p-5 sm:min-h-[31rem] sm:p-8" aria-live="polite">
        <div className="mb-6 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <span>{isCompleted ? "Learned" : "Take your time"}</span>
          <span>{index + 1} / {cards.length}</span>
        </div>
        <div className="flex-1 space-y-5">
          <h2 className="font-heading text-2xl font-semibold leading-tight sm:text-3xl">{card.title}</h2>
          <div className="text-base leading-relaxed text-foreground sm:text-lg">
            <Prose body={card.answer} />
          </div>
        </div>
        {isLastCard ? (
          <div className="mt-7 flex flex-col items-end gap-3 border-t border-teal-900/10 pt-4">
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={onStartPractice} disabled={!allCardsCompleted || practiceDisabled}>
                {practiceDisabled ? "Checkpoint passed" : "Practise this topic"} <Icon name={practiceDisabled ? "Check" : "ArrowRight"} className="size-4" />
              </Button>
              <Button type="button" onClick={() => void completeAndContinue()} disabled={isCompleted || completing}>
                {completing ? "Saving…" : isCompleted ? "Learned" : "Finish learning"}
                <Icon name="Check" className="size-4" />
              </Button>
            </div>
            {!allCardsCompleted ? <p className="text-right text-xs text-muted-foreground">Finish all learning cards to unlock practice.</p> : practiceDisabled ? <p className="text-right text-xs text-muted-foreground">You have passed this lesson. Revisit these cards whenever you need a refresher.</p> : null}
            {practiceError ? <p role="alert" className="text-right text-sm text-destructive">{practiceError}</p> : null}
          </div>
        ) : null}
      </article>

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={() => onNavigate(index - 1)} disabled={index === 0}><Icon name="ArrowLeft" className="size-4" /> Previous</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => void completeAndContinue(index + 1)}
          disabled={index === cards.length - 1 || completing}
        >
          Next <Icon name="ArrowRight" className="size-4" />
        </Button>
      </div>
    </section>
  )
}
