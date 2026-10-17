import * as React from "react"
import { Icon } from "@/components/app/icon"
import type { LegalBlock, LegalDoc } from "@/lib/legal"

/** Renders **bold** spans inside an otherwise plain string. */
function withBold(text: string): React.ReactNode[] {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-foreground">
        {part}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  )
}

function Block({ block }: { block: LegalBlock }) {
  if (block.k === "sub") {
    return <h3 className="mt-4 font-heading text-base font-semibold">{withBold(block.text)}</h3>
  }
  if (block.k === "list") {
    return (
      <ul className="ml-1 space-y-2">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <Icon name="ChevronRight" className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{withBold(item)}</span>
          </li>
        ))}
      </ul>
    )
  }
  return <p className="text-sm leading-relaxed text-muted-foreground">{withBold(block.text)}</p>
}

export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold md:text-4xl">{doc.title}</h1>
        <p className="text-sm text-muted-foreground">
          Effective date: {doc.effectiveDate} - Last updated: {doc.lastUpdated}
        </p>
      </div>

      {/* Notice */}
      <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-muted-foreground">
        {withBold(doc.notice)}
      </div>

      {/* Intro */}
      <div className="mt-6 space-y-3">
        {doc.intro.map((b, i) => (
          <Block key={i} block={b} />
        ))}
      </div>

      {/* Table of contents */}
      <nav className="mt-8 rounded-2xl border border-border bg-card p-4">
        <p className="mb-2 font-heading text-sm font-semibold">Contents</p>
        <ol className="grid gap-1 sm:grid-cols-2">
          {doc.sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {s.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Sections */}
      <div className="mt-8 space-y-8">
        {doc.sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-20 space-y-3">
            <h2 className="font-heading text-xl font-semibold">{s.heading}</h2>
            {s.blocks.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}


