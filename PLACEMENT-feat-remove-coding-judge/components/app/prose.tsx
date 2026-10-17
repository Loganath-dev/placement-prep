import { Icon } from "@/components/app/icon"
import { cn } from "@/lib/utils"

/**
 * Lightweight markdown-ish renderer for lesson bodies.
 * Supports **bold**, ordered/unordered lists, and named callout sections
 * (Worked example, Exam tip, Common mistake, etc.).
 *
 * Intentionally has zero dependency on domain logic (scoring, store, access).
 */
export function Prose({ body }: { body: string }) {
  const blocks = body.split("\n\n")
  return (
    <div className="space-y-4 text-base leading-7 text-foreground/90 tracking-[0.01em]">
      {blocks.map((block, i) => {
        const section = proseSection(block)
        if (section) {
          return (
              <div
              key={i}
              className={cn(
                "rounded-xl border p-4 shadow-sm",
                section.tone === "example" && "border-primary/20 bg-primary/[0.06]",
                section.tone === "tip" && "border-success/25 bg-success/[0.08]",
                section.tone === "mistake" && "border-warning/30 bg-warning/[0.12]",
                section.tone === "practice" && "border-border bg-muted/45",
              )}
            >
              <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                <Icon name={section.icon} className="size-4" />
                {section.label}
              </p>
              <div>{renderInline(section.body)}</div>
            </div>
          )
        }

        if (isListBlock(block)) {
          return (
            <div key={i} className="rounded-xl bg-muted/35 p-4 shadow-sm">
              {renderListBlock(block)}
            </div>
          )
        }

        return <p key={i}>{renderInline(block)}</p>
      })}
    </div>
  )
}

// ── Private helpers ───────────────────────────────────────────────────────────

type ProseTone = "example" | "tip" | "mistake" | "practice"

function proseSection(block: string) {
  const match = block.match(
    /^\*\*(Why recruiters test this|Worked example|Worked intuition|Example|Exam tip|Placement tip|Tip \/ trick|Shortcut|Shortcut mindset|Common mistake|Common trap|Practice like a topper|Fast revision loop|Interview transfer):\*\*\s*([\s\S]*)$/,
  )
  if (!match) return null

  const [, label, body] = match
  const lowered = label.toLowerCase()

  let tone: ProseTone
  let icon: string

  if (lowered.includes("mistake") || lowered.includes("trap")) {
    tone = "mistake"; icon = "Flag"
  } else if (lowered.includes("recruiters")) {
    tone = "practice"; icon = "Briefcase"
  } else if (lowered.includes("tip") || lowered.includes("shortcut")) {
    tone = "tip"; icon = "Target"
  } else if (lowered.includes("practice") || lowered.includes("revision") || lowered.includes("transfer")) {
    tone = "practice"; icon = "Target"
  } else {
    tone = "example"; icon = "BookOpen"
  }

  return { label, body, tone, icon }
}

function isListBlock(block: string) {
  return block.split("\n").some((line) => /^(\d+\.|- )/.test(line.trim()))
}

function renderListBlock(block: string) {
  const lines = block.split("\n")
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const trimmed = line.trim()
        const ordered = trimmed.match(/^(\d+)\.\s+(.*)$/)
        const unordered = trimmed.match(/^-\s+(.*)$/)
        if (ordered) {
          return (
            <div key={index} className="flex gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-background text-xs font-bold text-primary ring-1 ring-border shadow-sm">
                {ordered[1]}
              </span>
              <span>{renderInline(ordered[2])}</span>
            </div>
          )
        }
        if (unordered) {
          return (
            <div key={index} className="flex gap-3">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary/70" />
              <span>{renderInline(unordered[1])}</span>
            </div>
          )
        }
        return <p key={index}>{renderInline(line)}</p>
      })}
    </div>
  )
}

function renderInline(text: string) {
  const lines = text.split("\n")
  return lines.map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return (
      <span key={li}>
        {parts.map((part, pi) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={pi} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <span key={pi}>{part}</span>
          ),
        )}
        {li < lines.length - 1 ? <br /> : null}
      </span>
    )
  })
}
