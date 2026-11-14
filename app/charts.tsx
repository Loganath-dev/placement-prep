import { cn } from "@/lib/utils"

/**
 * Branded chart primitives. They share the PRI gauge's visual language —
 * gradient fills (brand blue → band tone), faint graduation ticks, a tinted
 * glow, and the signature easing — so data across the app reads as one
 * instrument family instead of generic flat bars. Pure/server-renderable.
 */

export type ChartTone = "danger" | "warning" | "info" | "success"

const TONE_VAR: Record<ChartTone, string> = {
  danger: "var(--destructive)",
  warning: "var(--warning)",
  info: "var(--primary)",
  success: "var(--success)",
}

const clamp = (n: number) => Math.max(0, Math.min(100, n))

// Faint vertical measurement ticks every 10% — the gauge bezel, on a track.
const TICKS_VERTICAL =
  "repeating-linear-gradient(90deg, color-mix(in oklch, var(--muted-foreground) 20%, transparent) 0 1px, transparent 1px 10%)"

// Faint horizontal gridlines every 25% for column charts.
const GRID_HORIZONTAL =
  "repeating-linear-gradient(0deg, color-mix(in oklch, var(--muted-foreground) 14%, transparent) 0 1px, transparent 1px 25%)"

/** Horizontal value bar (0–100): accuracy, mastery, progress. */
export function BrandedBar({
  value,
  tone = "info",
  height = 10,
  showTicks = true,
  className,
}: {
  value: number
  tone?: ChartTone
  height?: number
  showTicks?: boolean
  className?: string
}) {
  const v = clamp(value)
  const color = TONE_VAR[tone]
  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-full bg-muted", className)}
      style={{ height }}
    >
      {showTicks ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: TICKS_VERTICAL }}
          aria-hidden
        />
      ) : null}
      <div
        className="relative h-full rounded-full"
        style={{
          width: `${v}%`,
          background: `linear-gradient(90deg, var(--primary), ${color})`,
          boxShadow: `0 0 10px -1px color-mix(in oklch, ${color} 45%, transparent)`,
          transition: "width 800ms var(--ease-signature)",
        }}
      />
    </div>
  )
}

/** Vertical column series with an optional dashed cutoff reference line. */
export function BrandedColumns({
  data,
  tone = "info",
  cutoff,
  className,
}: {
  data: { value: number; label?: string; title?: string }[]
  tone?: ChartTone
  /** 0–100 reference line (e.g. a company cutoff) drawn across the plot. */
  cutoff?: number
  className?: string
}) {
  const color = TONE_VAR[tone]
  return (
    <div className={cn("relative", className)}>
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{ backgroundImage: GRID_HORIZONTAL }}
        aria-hidden
      />
      {cutoff != null ? (
        <div
          className="pointer-events-none absolute inset-x-2 border-t border-dashed border-primary/45"
          style={{ bottom: `calc(${clamp(cutoff)}% )` }}
          aria-hidden
        >
          <span className="absolute -top-2.5 right-0 bg-card/80 px-1 text-[9px] font-medium text-primary/80">
            cutoff
          </span>
        </div>
      ) : null}
      <div className="relative flex h-full items-end gap-2 p-2">
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
            <div
              className="animate-rise w-full rounded-t-md"
              title={d.title}
              style={{
                height: `${Math.max(6, clamp(d.value))}%`,
                background: `linear-gradient(180deg, ${color}, var(--primary))`,
                boxShadow: `0 0 10px -2px color-mix(in oklch, ${color} 42%, transparent)`,
                animationDelay: `${i * 60}ms`,
              }}
            />
            {d.label ? (
              <span className="text-[10px] tabular-nums text-muted-foreground">{d.label}</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
