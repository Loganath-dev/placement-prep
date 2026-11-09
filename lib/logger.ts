/**
 * Structured logging + a vendor-agnostic error-capture seam.
 *
 * Isomorphic (server + client). Logs a single structured JSON line in
 * production so any aggregator (Vercel, Datadog, Logtail) can parse it, and a
 * readable line in development.
 *
 * Error tracking is pluggable: nothing is hard-wired to a vendor. To enable
 * Sentry (or similar) later, call `registerErrorReporter` once at startup:
 *
 *   import * as Sentry from "@sentry/nextjs"
 *   registerErrorReporter((err, ctx) => Sentry.captureException(err, { extra: ctx }))
 *
 * Until a reporter is registered, captureError still logs — so errors are never
 * silently swallowed, they just aren't forwarded off-box yet.
 */

type Level = "debug" | "info" | "warn" | "error"
export type LogFields = Record<string, unknown>

const isProd = process.env.NODE_ENV === "production"

function emit(level: Level, message: string, fields?: LogFields) {
  const line = isProd
    ? JSON.stringify({ level, message, time: new Date().toISOString(), ...fields })
    : `[${level}] ${message}${fields ? ` ${JSON.stringify(fields)}` : ""}`
  const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log
  sink(line)
}

export const logger = {
  debug: (message: string, fields?: LogFields) => {
    if (!isProd) emit("debug", message, fields)
  },
  info: (message: string, fields?: LogFields) => emit("info", message, fields),
  warn: (message: string, fields?: LogFields) => emit("warn", message, fields),
  error: (message: string, fields?: LogFields) => emit("error", message, fields),
}

// ── Pluggable error reporter ──────────────────────────────────────────────────

type ErrorReporter = (error: Error, context?: LogFields) => void

let reporter: ErrorReporter | null = null

/** Register an off-box error sink (e.g. Sentry). Replaces any previous one. */
export function registerErrorReporter(fn: ErrorReporter): void {
  reporter = fn
}

/**
 * Log an error in structured form and forward it to the registered reporter.
 * Always safe: a throwing reporter can never break the calling request.
 */
export function captureError(error: unknown, context?: LogFields): void {
  const err = error instanceof Error ? error : new Error(String(error))
  logger.error(err.message, { ...context, stack: err.stack })
  try {
    reporter?.(err, context)
  } catch (reporterError) {
    console.error("[logger] error reporter threw:", reporterError)
  }
}
