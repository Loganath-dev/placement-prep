/**
 * Next.js instrumentation — runs once when the server boots.
 *
 * We validate the environment here so a misconfigured deploy fails fast and
 * loudly instead of surfacing as confusing runtime 500s deep in a request.
 * Required (core) vars crash the process in production; optional feature groups
 * only log an informational notice that the feature is disabled.
 */
export async function register() {
  // Only run on the Node.js server runtime (not edge or the browser).
  if (process.env.NEXT_RUNTIME !== "nodejs") return

  const { inspectEnv } = await import("@/lib/env")
  const report = inspectEnv()

  for (const [feature, vars] of Object.entries(report.unconfiguredFeatures)) {
    console.info(`[env] ${feature} is disabled (unset: ${vars.join(", ")})`)
  }

  if (!report.ok) {
    const message = `[env] Missing required environment variables: ${report.missingRequired.join(", ")}`
    // Throw only when actually serving — never during `next build` (which also
    // runs under NODE_ENV=production and must not need runtime secrets to compile).
    const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build"
    if (process.env.NODE_ENV === "production" && !isBuildPhase) {
      // Fail fast: a production server with no Supabase config cannot serve users.
      throw new Error(message)
    }
    console.warn(`${message} — the app will not work correctly until these are set.`)
  }
}

/**
 * Central server-side error hook (Next.js). Every uncaught error in a route
 * handler, server component, or middleware lands here, so error capture is
 * wired in one place instead of per try/catch.
 */
export async function onRequestError(
  error: unknown,
  request: { path?: string; method?: string },
  context: { routerKind?: string; routePath?: string; routeType?: string },
) {
  const { captureError } = await import("@/lib/logger")
  captureError(error, {
    path: request?.path,
    method: request?.method,
    routerKind: context?.routerKind,
    routePath: context?.routePath,
    routeType: context?.routeType,
  })
}
