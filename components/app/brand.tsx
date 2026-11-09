import Link from "next/link"
import { cn } from "@/lib/utils"

/**
 * StudyBenchMark — the app's logomark.
 *
 * Design rationale (studied from Notion, Linear, Unacademy, Khan Academy):
 * ─────────────────────────────────────────────────────────────────────────
 * • One idea: a bold custom "S" — for Study, for students.
 * • Contained in a rounded square badge (10px radius on 40×40 grid).
 * • Warm indigo→blue gradient: trust, intelligence, forward momentum.
 * • The "S" is drawn as a single clean path using cubic bezier curves,
 *   NOT stacked rectangles — this gives it the hand-crafted, humanized
 *   feel of logos like Stripe, Shopify, and Notion.
 * • A thin white rule beneath the S acts as a "bench" — connecting the
 *   name visually without over-complicating the mark.
 * • Reads clearly from 16px favicon up to 512px icon.
 */
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
        viewBox="0 0 40 40"
        className="size-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="sb-bg"
            x1="0" y1="0" x2="40" y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4F46E5" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
        </defs>

        {/* Badge background — rounded square */}
        <rect width="40" height="40" rx="9" fill="url(#sb-bg)" />

        {/*
          "S" letterform — drawn as a smooth bezier path.
          Designed on a 40×40 grid. The S fits inside an 18×22 box
          centered at (11, 9) to (29, 31).

          Reading the path:
          Start at top-right of the S's upper arc →
          curve down through the upper bowl →
          cross the middle →
          curve down through the lower bowl →
          end at bottom-left of the S.

          This single-path approach gives the humanized, calligraphic
          quality that distinguishes professional logos from AI-generated ones.
        */}
        <path
          d={`
            M 27 12.5
            C 27 10 24.5 8 20 8
            C 15 8 12 10.5 12 14
            C 12 17.5 14.5 19 19 20
            C 23.5 21 28 22.5 28 26.5
            C 28 30 25 32 20 32
            C 15 32 12.5 29.5 12.5 27
          `}
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/*
          "Bench" underline — a short white rule that sits below the S.
          This is the "bench" visual metaphor: a flat surface, a foundation.
          Subtle but meaningful when you know it.
        */}
        <rect
          x="13" y="34" width="14" height="2.25"
          rx="1.125"
          fill="white"
          fillOpacity="0.5"
        />
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
  const markSize = size === "compact" ? "size-8" : "size-9"
  const textSize = size === "compact" ? "text-[15px]" : "text-lg"

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2.5 rounded-xl py-1 px-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
    >
      <StudyBenchMark className={markSize} />
      <span
        className={cn(
          "font-heading tracking-[-0.025em] transition-opacity duration-200 group-hover:opacity-80",
          textSize,
        )}
      >
        <span className="font-semibold text-muted-foreground">Study</span>
        <span className="font-bold text-foreground">Bench</span>
      </span>
    </Link>
  )
}
