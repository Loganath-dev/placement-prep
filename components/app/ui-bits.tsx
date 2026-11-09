/**
 * Shared readiness & company display primitives.
 *
 * Focused concern: PRI/scoring visualisation + company identity chips.
 * For rich-text rendering use <Prose> from ./prose.
 * For upgrade prompts use <UpgradeBanner> / <LockedFeatureCard> from ./upgrade-prompt.
 */
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/app/icon"
import { getCompany } from "@/lib/data/companies"
import { getSections } from "@/lib/data/content"
import type { Band } from "@/lib/scoring"
import {
  computePRI,
  mockMastery,
  PRI_WEIGHTS,
  readinessBand,
  sectionMastery,
} from "@/lib/scoring"
import type { CompanyId, CompanyProgress } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Square initials chip tinted with the company accent. */
export function CompanyAvatar({
  id,
  size = 40,
  className,
}: {
  id: CompanyId
  size?: number
  className?: string
}) {
  const c = getCompany(id)
  const initials = c.short.slice(0, 2).toUpperCase()
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-heading font-bold text-white ring-1 ring-border/40",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: c.accent,
        fontSize: size * 0.36,
      }}
      aria-hidden
    >
      {initials}
    </span>
  )
}

const TONE_CLASS: Record<Band["tone"], string> = {
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-warning/14 text-warning-foreground border-warning/25",
  info: "bg-accent text-accent-foreground border-border",
  success: "bg-success/10 text-[color:var(--success)] border-success/25",
}

export function ToneBadge({ band, className }: { band: Band; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-md font-mono text-[11px] font-semibold uppercase tracking-[0.08em]", TONE_CLASS[band.tone], className)}
    >
      {band.label}
    </Badge>
  )
}

/**
 * Readiness band (Beginner → Highly Ready) derived from the PRI.
 * Shows a band label, not a raw percentage, to keep the signal honest.
 */
export function ProbabilityStat({ pri, compact = false }: { pri: number; compact?: boolean }) {
  const band = readinessBand(pri)
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "rounded-md border font-heading font-semibold",
          TONE_CLASS[band.tone],
          compact ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        )}
      >
        {band.label}
      </span>
      <span className="text-xs text-muted-foreground">readiness</span>
    </div>
  )
}

/** PRI breakdown panel showing per-section scores and estimate inputs. */
export function ProbabilityInputs({
  companyId,
  progress,
  compact = false,
}: {
  companyId: CompanyId
  progress: CompanyProgress
  compact?: boolean
}) {
  const company = getCompany(companyId)
  const pri = computePRI(companyId, progress)
  const mock = mockMastery(progress)
  const sections = getSections(companyId)
    .map((section) => ({
      label: section.short,
      value: sectionMastery(companyId, section.id, progress),
      weight: PRI_WEIGHTS[section.id],
    }))
    .sort((a, b) => a.value - b.value)
  const weakest = sections[0]

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-muted/32 p-3 text-xs text-muted-foreground",
        compact ? "space-y-2" : "space-y-3",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
          <Icon name="ListChecks" className="size-3.5 text-primary" />
          Estimate inputs
        </span>
        <span>PRI {pri}/100</span>
        <span>Target {company.cutoffPRI}</span>
        <span>Mock avg {mock || "none"}</span>
        {weakest ? <span>Weakest {weakest.label} {weakest.value}%</span> : null}
      </div>
      {!compact ? (
        <div className="grid gap-1.5 sm:grid-cols-3">
          {sections.slice(0, 6).map((section) => (
            <div key={section.label} className="flex items-center justify-between gap-2">
              <span className="truncate">{section.label}</span>
              <span className="tabular-nums text-foreground">
                {section.value}% - {Math.round(section.weight * 100)}%
              </span>
            </div>
          ))}
        </div>
      ) : null}
      <p>
        Uses only in-app chapter scores, mock average and this company&apos;s PRI target.
        It does not include eligibility, hiring demand, interview performance or recruiter decisions.
      </p>
    </div>
  )
}

export function SectionProgressBar({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon?: string
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium">
          {icon ? <Icon name={icon} className="size-3.5 text-muted-foreground" /> : null}
          {label}
        </span>
        <span className="tabular-nums text-muted-foreground">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm bg-muted ring-1 ring-border/60">
        <div
          className="h-full rounded-sm bg-primary transition-[width] duration-700"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  )
}
