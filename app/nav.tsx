"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { StudyBenchWordmark } from "@/app/brand"
import { Icon } from "@/components/app-icon"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useStoreActions, useStoreState } from "@/lib/store"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { isConfiguredAdminEmail } from "@/lib/admin-config"
import { earnedBadges } from "@/lib/data/badges"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface NavItem {
  href: string
  label: string
  icon: string
}

/**
 * Primary navigation grouped into five zones (Home / Learn / Practice / Review / Account)
 * so the sidebar reads as an intentional workflow instead of a flat 12-item list.
 */
export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Home",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/learn/aptitude", label: "Aptitude", icon: "Calculator" },
      { href: "/learn/logical-verbal", label: "Logical & Verbal", icon: "Puzzle" },
      { href: "/learn/cs-core", label: "CS Core", icon: "Cpu" },
      { href: "/learn/programming-languages", label: "Programming Languages", icon: "Code2" },
      { href: "/learn/dsa", label: "DSA", icon: "Layers" },
      { href: "/learn/tracks", label: "Tracks", icon: "GraduationCap" },
      { href: "/challenges", label: "Challenges", icon: "CalendarCheck" },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/practice", label: "Practice Library", icon: "BookOpen" },
      { href: "/mock", label: "Mock Tests", icon: "Target" },
    ],
  },
  {
    label: "Review",
    items: [
      { href: "/analytics", label: "Analytics", icon: "ChartColumn" },
      { href: "/bookmarks", label: "Bookmarks", icon: "Bookmark" },
      { href: "/history", label: "Historical Progress", icon: "History" },
    ],
  },
]

/** Flat list kept for any consumer that needs every primary destination. */
export const NAV_ITEMS: readonly NavItem[] = NAV_GROUPS.flatMap((g) => g.items)

const FOOTER_ITEMS: NavItem[] = [
  { href: "/referrals", label: "Refer & Earn", icon: "Users" },
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
          ? "bg-primary/8 text-foreground ring-1 ring-primary/15 before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.75 before:-translate-y-1/2 before:rounded-r-full before:bg-primary"
          : "text-sidebar-foreground/62 hover:bg-background/72 hover:text-sidebar-foreground",
      )}
    >
      <Icon
        name={icon}
        className={cn(
          "size-4.5 transition-colors",
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
  const { signOut } = useStoreActions()
  const [isAdmin, setIsAdmin] = React.useState(false)
  const isActive = (href: string) => {
    const [path, anchor] = href.split("#")
    if (pathname !== path && !pathname.startsWith(path + "/")) return false
    if (!anchor) return pathname === path
    return typeof window !== "undefined" && window.location.hash === `#${anchor}`
  }

  React.useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }: { data: { user: { email?: string | null; app_metadata?: { role?: string } } | null } }) => {
        const user = data?.user
        setIsAdmin(isConfiguredAdminEmail(user?.email))
      })
  }, [])

  async function handleSignOut() {
    onNavigate?.()
    await signOut()
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
      {isAdmin ? <><NavLink href="/admin" label="Admin dashboard" icon="LayoutDashboard" active={isActive("/admin")} onClick={onNavigate} /><NavLink href="/admin/referrals" label="Affiliate management" icon="Wallet" active={isActive("/admin/referrals")} onClick={onNavigate} /><NavLink href="/admin/content" label="Content review" icon="ClipboardCheck" active={isActive("/admin/content")} onClick={onNavigate} /></> : null}
      <button
        type="button"
        onClick={handleSignOut}
        className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-sidebar-foreground/65 transition-colors hover:bg-background/70 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <Icon name="LogOut" className="size-4.5" />
        Sign out
      </button>
    </nav>
  )
}

export function AppSidebar() {
  return (
    <aside className="sb-sidebar sticky top-0 hidden h-svh w-59 shrink-0 flex-col gap-4 border-r border-sidebar-border bg-sidebar p-4 lg:flex">
      <div className="pt-2">
        <Brand />
      </div>
      <NavList />
    </aside>
  )
}

export function AdminSidebar() {
  const { signOut } = useStoreActions()
  const pathname = usePathname()
  const links: NavItem[] = [
    { href: "/admin", label: "Overview", icon: "LayoutDashboard" },
    { href: "/admin/referrals", label: "Affiliate management", icon: "Wallet" },
    { href: "/admin/content", label: "Content review", icon: "ClipboardCheck" },
    { href: "/admin/metrics", label: "Platform metrics", icon: "ChartColumn" },
    { href: "/admin/reports", label: "Question reports", icon: "Flag" },
  ]
  return (
    <aside className="sb-sidebar sticky top-0 hidden h-svh w-59 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 lg:flex">
      <div className="border-b border-sidebar-border pb-5 pt-2">
        <StudyBenchWordmark href="/admin" size="compact" />
        <p className="mt-5 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">Workspace</p>
        <p className="mt-1 px-2 text-sm font-semibold text-sidebar-foreground">Administration</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 pt-5">
        {links.map((link) => (
          <NavLink key={link.href} {...link} active={pathname === link.href} />
        ))}
      </nav>
      <div className="space-y-2 border-t border-sidebar-border pt-4">
        <Link href="/dashboard" className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-background/70 hover:text-sidebar-foreground">
          <Icon name="GraduationCap" className="size-4.5" /> Student app
        </Link>
        <button type="button" onClick={() => void signOut()} className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-sidebar-foreground/65 transition-colors hover:bg-background/70 hover:text-sidebar-foreground">
          <Icon name="LogOut" className="size-4.5" /> Sign out
        </button>
      </div>
    </aside>
  )
}

export function AdminTopbar() {
  const [open, setOpen] = React.useState(false)
  const { signOut } = useStoreActions()
  const pathname = usePathname()
  const links: NavItem[] = [
    { href: "/admin", label: "Overview", icon: "LayoutDashboard" },
    { href: "/admin/referrals", label: "Affiliate management", icon: "Wallet" },
    { href: "/admin/content", label: "Content review", icon: "ClipboardCheck" },
    { href: "/admin/metrics", label: "Platform metrics", icon: "ChartColumn" },
    { href: "/admin/reports", label: "Question reports", icon: "Flag" },
  ]
  return (
    <header className="sb-topbar sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md md:px-7">
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open administration menu"><Icon name="Menu" className="size-5" /></Button></SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-4">
              <SheetTitle className="sr-only">Administration navigation</SheetTitle>
              <SheetDescription className="sr-only">Private StudyBench administration</SheetDescription>
              <div className="mb-5 border-b border-sidebar-border pb-5 pt-2"><StudyBenchWordmark href="/admin" size="compact" /><p className="mt-4 px-2 text-sm font-semibold">Administration</p></div>
              <nav className="flex flex-col gap-1">
                {links.map((link) => <NavLink key={link.href} {...link} active={pathname === link.href} onClick={() => setOpen(false)} />)}
                <Link href="/dashboard" onClick={() => setOpen(false)} className="mt-3 flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"><Icon name="GraduationCap" className="size-4.5" /> Student app</Link>
                <button type="button" onClick={() => void signOut()} className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold"><Icon name="LogOut" className="size-4.5" /> Sign out</button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <Link href="/admin" className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">S</span><span className="font-semibold tracking-tight">StudyBench <span className="font-normal text-muted-foreground">Admin</span></span></Link>
      </div>
      <span className="hidden text-xs font-medium text-muted-foreground sm:block">Private workspace</span>
    </header>
  )
}

export function AppTopbar() {
  const { state } = useStoreState()
  const { signOut } = useStoreActions()
  const [affiliateJoined, setAffiliateJoined] = React.useState(false)
  const badges = earnedBadges(state)
  const featuredBadge = badges[0]
  const profileName = state.profile.name.trim() || "StudyBench student"
  const initials = profileName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()

  React.useEffect(() => {
    let active = true
    const loadAffiliateStatus = async () => {
      try {
        const response = await fetch("/api/affiliate/dashboard", { cache: "no-store" })
        if (!response.ok) return
        const result = await response.json()
        if (active) setAffiliateJoined(result.account?.status === "active")
      } catch {
        // Keep the enrollment link available if status cannot be checked.
      }
    }
    const refresh = () => { void loadAffiliateStatus() }
    refresh()
    window.addEventListener("affiliate-account-updated", refresh)
    return () => {
      active = false
      window.removeEventListener("affiliate-account-updated", refresh)
    }
  }, [])

  return (
    <header className="sb-topbar sticky top-0 z-30 flex h-16 min-w-0 items-center justify-between gap-1 border-b border-border bg-background/95 px-2 backdrop-blur-md sm:gap-2 sm:px-4 md:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <MobileNav />
        <span className="hidden md:block"><Brand /></span>
      </div>
      <div className="hidden flex-1 lg:block" />
      <div className="flex shrink-0 flex-nowrap items-center gap-1 sm:gap-2">
        {!state.premium ? (
          <Link
            href="/pricing"
            className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-primary/25 bg-primary/[0.06] px-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 sm:px-3"
            aria-label="Join Premium and view available plans"
          >
              <Icon name="Crown" className="size-4 sm:size-4.5" />
              <span className="hidden sm:inline">Join Premium</span>
          </Link>
        ) : null}
        {!affiliateJoined ? (
          <Link
            href="/referrals"
            className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-card px-1.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/4 hover:text-primary sm:px-3"
            title="Join the affiliate programme"
            aria-label="Join affiliate programme"
          >
            <Icon name="Users" className="size-4 text-primary sm:size-4.5" />
            <span className="hidden sm:inline">Join affiliate</span>
          </Link>
        ) : null}
        <span
          className="flex h-10 shrink-0 items-center gap-1 rounded-xl border border-amber-200/80 bg-amber-50/70 px-2 text-sm font-semibold text-foreground sm:gap-1.5 sm:px-3"
          title="Daily streak"
          aria-label={`${state.streak.count} day streak`}
        >
          <Icon name="Flame" className="size-4 fill-orange-400 text-orange-600 sm:size-4.5" />
          <span className="tabular-nums text-orange-700">{state.streak.count}</span>
        </span>
        <Link
          href="/analytics"
          className="flex h-10 shrink-0 items-center gap-1 rounded-xl border border-border bg-card px-2 text-left transition-colors hover:border-primary/25 hover:bg-primary/3 sm:gap-2 sm:px-3"
          title={`${state.xp} experience points`}
          aria-label={`${state.xp.toLocaleString("en-IN")} experience points`}
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary sm:size-8">
            <Icon name="Zap" className="size-4 sm:size-4.5" />
          </span>
          <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-primary">{state.xp.toLocaleString("en-IN")} XP</span>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label={`Open profile for ${profileName}`} className="relative grid size-9 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary/10 text-sm font-bold text-primary outline-none transition-colors hover:border-primary/35 hover:bg-primary/15 focus-visible:ring-3 focus-visible:ring-ring/30 sm:size-10">
              {initials || "U"}
              <span className="absolute -bottom-1 -right-1 grid size-4.5 place-items-center rounded-full border-2 border-white bg-amber-100 text-amber-700" title={featuredBadge?.label ?? "No badge earned yet"}>
                <Icon name={featuredBadge?.icon ?? "BadgeCheck"} className="size-3" />
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2">
            <DropdownMenuLabel className="px-3 py-2">
              <span className="block truncate text-sm font-semibold">{profileName}</span>
              <span className="mt-1 block text-xs font-normal text-muted-foreground">{state.premium ? "Premium member" : "Free plan"}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-2 px-3 py-2 text-xs">
              <p className="flex items-center justify-between"><span className="text-muted-foreground">Experience</span><strong>{state.xp.toLocaleString("en-IN")} XP</strong></p>
              <p className="flex items-center justify-between"><span className="text-muted-foreground">Current streak</span><strong>{state.streak.count} days</strong></p>
              <div className="border-t pt-2">
                <p className="mb-1 text-muted-foreground">Badges ({badges.length}/15)</p>
                {featuredBadge ? <p className="flex items-center gap-1.5 font-semibold text-amber-800"><Icon name={featuredBadge.icon} className="size-3.5" />{featuredBadge.label}</p> : <p className="text-muted-foreground">Keep studying to earn your first badge.</p>}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/settings"><Icon name="Settings" />Settings</Link></DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { void signOut() }}><Icon name="LogOut" />Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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




export function MobileBottomNav() {
  const pathname = usePathname()
  const items = [
    { href: "/dashboard", label: "Home", icon: "LayoutDashboard" },
    { href: "/learn", label: "Learn", icon: "Route" },
    { href: "/practice", label: "Practice", icon: "BookOpen" },
    { href: "/analytics", label: "Progress", icon: "ChartColumn" },
  ]
  return (
    <nav aria-label="Primary mobile navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-8px_28px_-24px_rgba(20,40,30,.35)] backdrop-blur lg:hidden">
      {items.map((item) => {
        const active = pathname === item.href || (item.href === "/learn" && pathname.startsWith("/learn/"))
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold transition-colors", active ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Icon name={item.icon} className="size-5" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
