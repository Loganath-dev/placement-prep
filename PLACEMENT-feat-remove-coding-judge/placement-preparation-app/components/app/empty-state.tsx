import * as React from "react"
import { Icon } from "@/components/app/icon"
import { cn } from "@/lib/utils"

/**
 * Branded empty state. The motif — concentric graduation rings with a tinted
 * core — deliberately echoes the PRI gauge, so empty screens read as part of
 * the same instrument language instead of a lone grey icon. Server-renderable.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  tone = "info",
}: {
  icon: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  tone?: "info" | "success" | "warning"
}) {
  const ring =
    tone === "success"
      ? "var(--success)"
      : tone === "warning"
        ? "var(--warning)"
        : "var(--primary)"

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
    >
      <div className="relative grid place-items-center">
        <svg
          width="104"
          height="104"
          viewBox="0 0 104 104"
          fill="none"
          aria-hidden
          className="text-muted-foreground/30"
        >
          <circle cx="52" cy="52" r="50" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
          <circle
            cx="52"
            cy="52"
            r="40"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeDasharray="1.25 6.5"
          />
          <circle
            cx="52"
            cy="52"
            r="29"
            fill={`color-mix(in oklch, ${ring} 9%, transparent)`}
            stroke={`color-mix(in oklch, ${ring} 28%, transparent)`}
            strokeWidth="1"
          />
        </svg>
        <span
          className="absolute grid size-12 place-items-center rounded-2xl"
          style={{
            color: ring,
            background: `color-mix(in oklch, ${ring} 12%, transparent)`,
            boxShadow: `0 8px 22px -14px color-mix(in oklch, ${ring} 60%, transparent)`,
          }}
        >
          <Icon name={icon} className="size-6" />
        </span>
      </div>

      <p className="mt-5 font-heading text-base font-semibold">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
