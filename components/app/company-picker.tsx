"use client"

import { CompanyAvatar } from "@/components/app/ui-bits"
import { SELECTABLE_COMPANIES } from "@/lib/data/companies"
import type { Company, CompanyId } from "@/lib/types"
import { cn } from "@/lib/utils"

/**
 * Reusable company chip-row used by Mock, Practice, Coding and Interview.
 * Previously this identical markup was duplicated in four pages; centralising it
 * keeps the selected/idle styling and a11y (`aria-pressed`) consistent everywhere.
 */
export function CompanyPicker({
  value,
  onChange,
  companies = SELECTABLE_COMPANIES,
  className,
}: {
  value: CompanyId
  onChange: (id: CompanyId) => void
  companies?: readonly Company[]
  className?: string
}) {
  return (
    <div
      className={cn(
        "-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0",
        className,
      )}
    >
      {companies.map((cc) => (
        <button
          key={cc.id}
          type="button"
          aria-pressed={value === cc.id}
          title={cc.name}
          onClick={() => onChange(cc.id)}
          className={cn(
            "flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
            value === cc.id
              ? "border-primary bg-primary/10 text-primary shadow-sm"
              : "border-border bg-background/70 hover:bg-muted/60",
          )}
        >
          <CompanyAvatar id={cc.id} size={20} /> {cc.short}
        </button>
      ))}
    </div>
  )
}


