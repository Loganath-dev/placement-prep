/** Shared company identity chip used in company-track selectors. */
import { getCompany } from "@/lib/data/companies"
import type { CompanyId } from "@/lib/types"
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

