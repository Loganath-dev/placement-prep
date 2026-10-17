import { cn } from "@/lib/utils"

const TONE_VAR: Record<string, string> = {
  danger: "var(--destructive)",
  warning: "var(--warning)",
  info: "var(--primary)",
  success: "var(--success)",
}

/**
 * Signature readiness gauge (PRI). Pure SVG — no client JS — so it renders on
 * the server and still draws on. The look is StudyBench's own: a gradient arc
 * with a tinted glow over a faint graduation ring, so the score reads like an
 * instrument rather than a generic progress circle.
 */
export function PriRing({
  value,
  size = 132,
  stroke = 11,
  label = "PRI",
  tone = "info",
  sublabel,
  className,
}: {
  value: number
  size?: number
  stroke?: number
  label?: string
  tone?: "danger" | "warning" | "info" | "success"
  sublabel?: string
  className?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, value))
  const offset = c - (clamped / 100) * c
  const color = TONE_VAR[tone]
  const gid = `pri-grad-${tone}`

  // Faint graduation ticks sit just inside the track — the gauge "bezel".
  const tickR = r - stroke / 2 - 3.5
  const tickC = 2 * Math.PI * tickR

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>

        {/* Graduation ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={tickR > 0 ? tickR : 0}
          fill="none"
          stroke="var(--muted-foreground)"
          strokeOpacity={0.22}
          strokeWidth={1.5}
          strokeDasharray={`1.25 ${Math.max(6, tickC / 36 - 1.25)}`}
        />

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />

        {/* Progress arc — gradient + tinted glow, draws on from empty */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="animate-pri-draw"
          style={
            {
              "--pri-c": `${c}`,
              "--pri-offset": `${offset}`,
              filter: `drop-shadow(0 0 5px color-mix(in oklch, ${color} 42%, transparent))`,
              transition: "stroke-dashoffset 700ms var(--ease-signature)",
            } as React.CSSProperties
          }
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-3xl font-bold tabular-nums leading-none">
          {clamped}
        </span>
        <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {sublabel ? (
          <span className="mt-0.5 text-[11px] text-muted-foreground">{sublabel}</span>
        ) : null}
      </div>
    </div>
  )
}
