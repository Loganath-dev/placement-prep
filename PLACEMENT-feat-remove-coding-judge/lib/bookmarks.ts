"use client"

// localStorage-backed bookmark store, exposed as a React external store so
// components stay in sync via useSyncExternalStore (SSR renders the empty
// snapshot; the client snapshot is read after hydration).

import * as React from "react"

const KEY = "studybench:bookmarks"

export interface Bookmark {
  id: string
  type: "lesson" | "interview" | "pyq"
  title: string
  href: string
  company?: string
  savedAt: number
}

function load(): Bookmark[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Bookmark[]
  } catch {
    return []
  }
}

function save(items: Bookmark[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(items))
  emitChange()
}

// ── external-store plumbing ──────────────────────────────────────────────────

const EMPTY: Bookmark[] = []
let cache: Bookmark[] | null = null
const listeners = new Set<() => void>()

function emitChange() {
  cache = null
  for (const listener of listeners) listener()
}

export function subscribeBookmarks(onChange: () => void): () => void {
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

/** Stable between mutations — safe as a useSyncExternalStore snapshot. */
export function getBookmarksSnapshot(): Bookmark[] {
  if (!cache) cache = load().sort((a, b) => b.savedAt - a.savedAt)
  return cache
}

export function getServerBookmarksSnapshot(): Bookmark[] {
  return EMPTY
}

// ── mutations and queries ─────────────────────────────────────────────────────

export function addBookmark(bm: Omit<Bookmark, "savedAt">): void {
  const items = load().filter((b) => b.id !== bm.id)
  save([{ ...bm, savedAt: Date.now() }, ...items])
}

export function removeBookmark(id: string): void {
  save(load().filter((b) => b.id !== id))
}

export function isBookmarked(id: string): boolean {
  return load().some((b) => b.id === id)
}

export function allBookmarks(): Bookmark[] {
  return getBookmarksSnapshot()
}

// ── hooks ─────────────────────────────────────────────────────────────────────

/** All bookmarks, newest first; re-renders on every add/remove. */
export function useBookmarks(): Bookmark[] {
  return React.useSyncExternalStore(
    subscribeBookmarks,
    getBookmarksSnapshot,
    getServerBookmarksSnapshot,
  )
}

/** Saved-state and toggle for a single item (lesson, interview answer, PYQ). */
export function useBookmark(id: string) {
  const bookmarked = React.useSyncExternalStore(
    subscribeBookmarks,
    () => isBookmarked(id),
    () => false,
  )
  function toggle(bm: Omit<Bookmark, "savedAt" | "id">) {
    if (bookmarked) removeBookmark(id)
    else addBookmark({ id, ...bm })
  }
  return { bookmarked, toggle }
}
