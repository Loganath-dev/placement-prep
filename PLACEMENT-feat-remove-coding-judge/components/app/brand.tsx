import Link from "next/link"
import { cn } from "@/lib/utils"

export function StudyBenchMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center rounded-xl",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 64 64"
        className="size-full"
        role="img"
        aria-label="StudyBench"
      >
        <rect width="64" height="64" rx="16" fill="#EFF6FF" />
        <defs>
          <linearGradient id="sb-shell" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFDF8" />
            <stop offset="1" stopColor="#F4EFE4" />
          </linearGradient>
          <linearGradient id="sb-flow" x1="21" y1="44" x2="44" y2="17" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1D4ED8" />
            <stop offset="1" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="48" height="48" rx="15" fill="url(#sb-shell)" />
        <path
          d="M22 45.5C22 40.1 25.8 36.5 31.7 36.5H41.5C46.3 36.5 49 39.1 49 43.5V46H22V45.5Z"
          fill="#172033"
        />
        <rect x="26" y="46" width="4.75" height="6" rx="2.2" fill="#172033" />
        <rect x="40.25" y="46" width="4.75" height="6" rx="2.2" fill="#172033" />
        <path
          d="M21.5 42.5C21.5 33.6 26.1 27 33.7 23.4C38.2 21.3 41 17.7 42.8 12.5H47C45.9 20.7 42.2 26.7 36 30.6C31.6 33.3 29 37.1 29 42.8V46H21.5V42.5Z"
          fill="url(#sb-flow)"
        />
        <path
          d="M18 15.5C18 13.6 19.6 12 21.5 12H27V26.5H18V15.5Z"
          fill="#F59E0B"
        />
        <path
          d="M27 12H31C33 12 34.5 13.5 34.5 15.5V21C34.5 22.9 32.9 24.5 31 24.5H27V12Z"
          fill="#FDBA74"
        />
        <circle cx="46.5" cy="17.5" r="3.75" fill="#22C55E" />
      </svg>
    </span>
  )
}

export function StudyBenchWordmark({
  href = "/dashboard",
  size = "default",
  className,
}: {
  href?: string
  size?: "default" | "compact"
  className?: string
}) {
  const markSize = size === "compact" ? "size-8" : "size-10"
  const textSize = size === "compact" ? "text-lg" : "text-xl"

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2.5 rounded-xl px-1.5 py-1 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
        className,
      )}
    >
      <StudyBenchMark className={markSize} />
      <span
        className={cn(
          "font-heading tracking-[-0.02em] transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-75",
          textSize,
        )}
      >
        <span className="font-medium text-foreground/70">Study</span>
        <span className="font-extrabold text-primary">Bench</span>
      </span>
    </Link>
  )
}
