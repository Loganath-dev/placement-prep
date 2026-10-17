import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/app/icon"
import { LaunchOffer } from "@/components/app/launch-offer"
import { premiumPriceLabel } from "@/lib/access"

/**
 * Full-width banner shown to free users at the top of gated pages.
 * Drives upgrades without blocking content for premium users.
 */
export function UpgradeBanner() {
  return (
    <div className="surface-panel flex flex-col items-start justify-between gap-3 rounded-xl border-primary/20 bg-[linear-gradient(135deg,var(--card),var(--accent))] p-4 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Icon name="Crown" className="size-5" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-heading text-sm font-semibold">Continue with the full practice set</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Get the remaining chapters, practice sets, mocks and company comparison tools.
          </p>
          <LaunchOffer variant="compact" className="mt-1.5" />
        </div>
      </div>
      <Button asChild className="shrink-0">
        <Link href="/settings">View premium</Link>
      </Button>
    </div>
  )
}

/**
 * In-page locked-state card for features that require premium.
 * Use instead of rendering partial/disabled content.
 */
export function LockedFeatureCard({
  title,
  description,
  cta = "Upgrade",
}: {
  title: string
  description: string
  cta?: string
}) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-background text-primary ring-1 ring-border">
        <Icon name="Lock" className="size-5" />
      </span>
      <p className="mt-3 font-heading text-lg font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
        Full access is {premiumPriceLabel()} and includes the remaining practice for your target companies.
      </p>
      <Button asChild className="mt-4">
        <Link href="/settings">
          {cta} <Icon name="ArrowRight" className="size-4" />
        </Link>
      </Button>
    </div>
  )
}
