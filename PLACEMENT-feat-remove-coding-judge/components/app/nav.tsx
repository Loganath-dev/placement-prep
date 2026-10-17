"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import { StudyBenchWordmark } from "@/components/app/brand"
import { Icon } from "@/components/app/icon"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useLevel, useStoreActions, useStoreState } from "@/lib/store"
import { cn } from "@/lib/utils"

export interface NavItem {
  href: string
  label: string
  icon: string
}

/**
 * Keep navigation close to the study loop so students spend less time choosing
 * a destination and more time preparing.
 */
export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Today",
    items: [{ href: "/dashboard", label: "Study plan", icon: "LayoutDashboard" }],
  },
  {
    label: "Learn",
    items: [
      { href: "/learn", label: "Company tracks", icon: "GraduationCap" },
      { href: "/revision", label: "Revision", icon: "BookMarked" },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/practice", label: "PYQs", icon: "BookOpen" },
      { href: "/coding", label: "Coding", icon: "Code2" },
      { href: "/mock", label: "Mocks", icon: "Target" },
    ],
  },
  {
    label: "Review",
    items: [
      { href: "/mistakes", label: "Mistakes", icon: "BookMarked" },
      { href: "/readiness", label: "Progress", icon: "TrendingUp" },
    ],
  },
]

/** Flat list kept for any consumer that needs every primary destination. */
export const NAV_ITEMS: readonly NavItem[] = NAV_GROUPS.flatMap((g) => g.items)

const FOOTER_ITEMS: NavItem[] = [
  { href: "/profile", label: "Profile", icon: "User" },
  { href: "/settings", label: "Settings", icon: "Settings" },
]

function Brand() {
  return <StudyBenchWordmark href="/dashboard" size="compact" />
}

function NavLink({
  href,
  label,
  icon,
  active,
  onClick,
}: {
  href: string
  label: string
  icon: string
  active: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/nav relative flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25 active:scale-[0.99]",
        // Active items carry a left accent bar + primary tint so the current
        // page reads at a glance, not just a faint ring.
        active
          ? "bg-primary/[0.08] text-foreground ring-1 ring-primary/15 before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-primary"
          : "text-sidebar-foreground/62 hover:bg-background/72 hover:text-sidebar-foreground",
      )}
    >
      <Icon
        name={icon}
        className={cn(
          "size-[18px] transition-colors",
          active
            ? "text-primary"
            : "text-sidebar-foreground/50 group-hover/nav:text-sidebar-foreground",
        )}
      />
      {label}
    </Link>
  )
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useStoreActions()
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  async function handleSignOut() {
    onNavigate?.()
    await signOut()
    router.push("/auth/login")
  }

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-0.5">
          <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase text-sidebar-foreground/45">
            {group.label}
          </p>
          {group.items.map((it) => (
            <NavLink key={it.href} {...it} active={isActive(it.href)} onClick={onNavigate} />
          ))}
        </div>
      ))}
      <div className="my-2 h-px bg-sidebar-border" />
      {FOOTER_ITEMS.map((it) => (
        <NavLink key={it.href} {...it} active={isActive(it.href)} onClick={onNavigate} />
      ))}
      <button
        type="button"
        onClick={handleSignOut}
        className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-sidebar-foreground/65 transition-colors hover:bg-background/70 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <Icon name="LogOut" className="size-[18px]" />
        Sign out
      </button>
    </nav>
  )
}

export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col gap-4 border-r border-sidebar-border bg-sidebar/92 p-4 backdrop-blur lg:flex">
      <div className="pt-2">
        <Brand />
      </div>
      <NavList />
    </aside>
  )
}

export function AppTopbar() {
  const { state } = useStoreState()
  const lvl = useLevel()
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/82 px-4 backdrop-blur-md md:px-7">
      <div className="flex items-center gap-2 lg:hidden">
        <MobileNav />
        <Brand />
      </div>
      <div className="hidden flex-1 lg:block" />
      <div className="flex items-center gap-2 sm:gap-3">
        <span
          className="flex min-h-10 items-center gap-1.5 rounded-md border border-border bg-card/72 px-3 py-2 text-sm font-semibold text-foreground"
          title="Daily streak"
        >
          <Icon name="CalendarCheck" className="size-4 text-primary" />
          <span className="tabular-nums text-primary">{state.streak.count}</span>
        </span>
        <Link
          href="/profile"
          className="flex min-h-10 items-center gap-1.5 rounded-md border border-border bg-card/72 px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-card focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
          title={`Level ${lvl.level} - ${state.xp} XP`}
        >
          <Icon name="Target" className="size-4" />
          <span className="tabular-nums">Lv {lvl.level}</span>
          <span className="hidden tabular-nums text-primary/70 sm:inline">
            - {state.xp} XP
          </span>
        </Link>
      </div>
    </header>
  )
}

function MobileNav() {
  const [open, setOpen] = React.useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Icon name="Menu" className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar p-4">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Main navigation menu for StudyBench.
        </SheetDescription>
        <div className="mb-4 pt-2">
          <Brand />
        </div>
        <NavList onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}


