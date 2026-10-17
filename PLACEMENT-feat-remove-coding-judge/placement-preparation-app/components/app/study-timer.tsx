"use client"

import * as React from "react"
import { Icon } from "@/components/app/icon"
import { cn } from "@/lib/utils"

type Mode = "focus" | "break"

const PRESETS: { label: string; focusMin: number; breakMin: number }[] = [
  { label: "25/5", focusMin: 25, breakMin: 5 },
  { label: "45/10", focusMin: 45, breakMin: 10 },
  { label: "90/15", focusMin: 90, breakMin: 15 },
]

export function StudyTimer() {
  const [open, setOpen] = React.useState(false)
  const [presetIndex, setPresetIndex] = React.useState(0)
  const [mode, setMode] = React.useState<Mode>("focus")
  const [running, setRunning] = React.useState(false)
  const [secondsLeft, setSecondsLeft] = React.useState(PRESETS[0].focusMin * 60)
  const [sessions, setSessions] = React.useState(0)
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const preset = PRESETS[presetIndex]
  const totalSeconds = mode === "focus" ? preset.focusMin * 60 : preset.breakMin * 60
  const progress = 1 - secondsLeft / totalSeconds
  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  function start() {
    setRunning(true)
  }

  function pause() {
    setRunning(false)
  }

  function reset() {
    setRunning(false)
    setSecondsLeft(mode === "focus" ? preset.focusMin * 60 : preset.breakMin * 60)
  }

  function switchPreset(idx: number) {
    setRunning(false)
    setPresetIndex(idx)
    setMode("focus")
    setSecondsLeft(PRESETS[idx].focusMin * 60)
  }

  React.useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!)
          setRunning(false)
          if (mode === "focus") {
            setSessions((n) => n + 1)
            setMode("break")
            return preset.breakMin * 60
          } else {
            setMode("focus")
            return preset.focusMin * 60
          }
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, mode, preset])

  const circumference = 2 * Math.PI * 26
  const strokeDash = circumference * (1 - progress)

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="mb-2 w-64 overflow-hidden rounded-2xl border border-border bg-background/95 shadow-[0_8px_32px_-8px_oklch(0.15_0.05_260_/_40%)] backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Study Timer
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted/60"
            >
              <Icon name="X" className="size-3.5" />
            </button>
          </div>

          {/* Preset selector */}
          <div className="flex gap-1 px-3 pt-3">
            {PRESETS.map((p, i) => (
              <button
                key={p.label}
                type="button"
                onClick={() => switchPreset(i)}
                className={cn(
                  "flex-1 rounded-lg border px-2 py-1 text-xs font-semibold transition-colors",
                  presetIndex === i
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted/50 text-muted-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Mode label */}
          <div className="px-4 pt-2 text-center">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold",
                mode === "focus"
                  ? "bg-primary/10 text-primary"
                  : "bg-success/10 text-[color:var(--success)]",
              )}
            >
              {mode === "focus" ? "Focus time" : "Break time"}
            </span>
          </div>

          {/* Ring timer */}
          <div className="flex flex-col items-center py-4">
            <div className="relative size-20">
              <svg className="size-full -rotate-90" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  fill="none"
                  stroke="var(--muted)"
                  strokeWidth="4"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  fill="none"
                  stroke={mode === "focus" ? "var(--primary)" : "var(--success)"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDash}
                  className="transition-[stroke-dashoffset] duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-lg font-bold tabular-nums">
                  {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                </span>
              </div>
            </div>
            {sessions > 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">{sessions} session{sessions > 1 ? "s" : ""} done</p>
            ) : null}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 px-4 pb-4">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted/50"
              title="Reset"
            >
              <Icon name="RotateCcw" className="size-4" />
            </button>
            <button
              type="button"
              onClick={running ? pause : start}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                running
                  ? "bg-muted text-foreground hover:bg-muted/80"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              <Icon name={running ? "Pause" : "Play"} className="size-4" />
              {running ? "Pause" : "Start"}
            </button>
          </div>
        </div>
      ) : null}

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={running ? `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} — click to open timer` : "Study timer"}
        className={cn(
          "flex h-12 items-center gap-2 rounded-full border border-border bg-background/90 px-4 shadow-md backdrop-blur-sm transition-all hover:shadow-lg",
          running && "border-primary/40 bg-primary/5",
        )}
      >
        <Icon name="Clock" className={cn("size-4", running ? "text-primary" : "text-muted-foreground")} />
        {running ? (
          <span className="font-mono text-sm font-semibold text-primary tabular-nums">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
        ) : (
          <span className="text-sm font-medium text-muted-foreground">Timer</span>
        )}
      </button>
    </div>
  )
}
