import * as React from "react"
import { Icon } from "@/components/app/icon"
import type { ContentBlock } from "@/lib/content/blocks"

/** Renders **bold** spans inside an otherwise plain string. */
export function withBold(text: string): React.ReactNode[] {
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

function Block({ block }: { block: ContentBlock }) {
  switch (block.k) {
    case "sub":
      return (
        <h3 className="mt-6 font-heading text-lg font-semibold">{withBold(block.text)}</h3>
      )
    case "list":
      return (
        <ul className="ml-1 space-y-2">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 leading-relaxed text-muted-foreground"
            >
              <Icon name="ChevronRight" className="mt-1 size-4 shrink-0 text-primary" />
              <span>{withBold(item)}</span>
            </li>
          ))}
        </ul>
      )
    case "ol":
      return (
        <ol className="ml-1 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 leading-relaxed text-muted-foreground">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <span>{withBold(item)}</span>
            </li>
          ))}
        </ol>
      )
    case "quote":
      return (
        <blockquote className="border-l-4 border-primary/40 bg-primary/5 py-2 pl-4 pr-3 text-muted-foreground italic">
          {withBold(block.text)}
        </blockquote>
      )
    default:
      return <p className="leading-relaxed text-muted-foreground">{withBold(block.text)}</p>
  }
}

export function RichText({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </div>
  )
}


