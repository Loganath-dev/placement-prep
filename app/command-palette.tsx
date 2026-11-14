"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { NAV_ITEMS } from "@/app/nav"

const COMMANDS = [
  ...NAV_ITEMS,
  { href: "/referrals", label: "Refer & Earn", icon: "Users" },
  { href: "/settings", label: "Settings", icon: "Settings" },
]

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const openRef = React.useRef(false)

  const changeOpen = React.useCallback((next: boolean) => {
    openRef.current = next
    setOpen(next)
    if (!next) setQuery("")
  }, [])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        changeOpen(!openRef.current)
      }
      if (event.key === "Escape") changeOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [changeOpen])

  const normalized = query.trim().toLowerCase()
  const results = COMMANDS.filter((item) =>
    !normalized || item.label.toLowerCase().includes(normalized) || item.href.toLowerCase().includes(normalized)
  )

  function navigate(href: string) {
    changeOpen(false)
    router.push(href)
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="top-[18%] translate-y-0 gap-3 p-3 sm:max-w-lg">
        <DialogHeader className="px-2 pt-2">
          <DialogTitle className="text-base">Go to a page</DialogTitle>
          <DialogDescription>Search StudyBench pages. Press Ctrl K or ⌘ K to open this palette.</DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search dashboard, learning, practice…"
          aria-label="Search pages"
        />
        <div className="max-h-72 overflow-y-auto" role="listbox" aria-label="Navigation results">
          {results.length ? results.map((item) => (
            <button
              key={item.href}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => navigate(item.href)}
              className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.href}</span>
            </button>
          )) : (
            <p className="px-3 py-7 text-center text-sm text-muted-foreground">No matching pages.</p>
          )}
        </div>
        <p className="px-2 text-[11px] text-muted-foreground">Navigate with your keyboard or select a result.</p>
      </DialogContent>
    </Dialog>
  )
}
