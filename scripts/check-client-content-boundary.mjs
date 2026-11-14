import { readdir, readFile, stat } from "node:fs/promises"
import path from "node:path"

const root = process.cwd()
const scanRoots = ["app", "components"]
const protectedModules = new Set([
  "lib/data/content",
  "lib/data/content-seed",
  "lib/data/programming-curriculum",
  "lib/data/question-bank",
  "lib/data/pyqs",
  "lib/data/mocks",
  "lib/server/learning-content",
])
const extensions = [".ts", ".tsx", ".js", ".jsx"]
const sourceExtensions = new Set(extensions)
const violations = new Set()
const clientEntries = []

async function walk(directory) {
  let entries
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") await walk(absolute)
      continue
    }
    if (!sourceExtensions.has(path.extname(entry.name))) continue
    const source = await readFile(absolute, "utf8")
    if (/^\s*["']use client["'];?/m.test(source)) clientEntries.push(absolute)
  }
}

function moduleKey(absolute) {
  return path.relative(root, absolute).replaceAll(path.sep, "/").replace(/\.(tsx?|jsx?)$/, "")
}

async function resolveLocalImport(fromFile, specifier) {
  let base
  if (specifier.startsWith("@/")) base = path.join(root, specifier.slice(2))
  else if (specifier.startsWith(".")) base = path.resolve(path.dirname(fromFile), specifier)
  else return null

  const candidates = [base, ...extensions.map((extension) => base + extension), ...extensions.map((extension) => path.join(base, `index${extension}`))]
  for (const candidate of candidates) {
    try {
      if ((await stat(candidate)).isFile()) return candidate
    } catch {
      // Try the next standard source extension.
    }
  }
  return null
}

async function scanClientGraph(entry) {
  const visited = new Set()
  const pending = [entry]
  while (pending.length) {
    const current = pending.pop()
    if (!current || visited.has(current)) continue
    visited.add(current)
    const source = await readFile(current, "utf8")
    const importPattern = /(?:\bfrom\s*|\bimport\s*(type\s+)?(?:\(\s*)?)["']([^"']+)["']/g
    for (const match of source.matchAll(importPattern)) {
      const lineStart = source.lastIndexOf("\n", match.index) + 1
      const importLine = source.slice(lineStart, match.index)
      if (match[1] || /\bimport\s+type\b/.test(importLine)) continue // Type-only imports are erased.
      const specifier = match[2]
      if (!specifier) continue
      const normalized = specifier.startsWith("@/") ? specifier.slice(2) : null
      if (normalized && [...protectedModules].some((moduleName) => normalized === moduleName || normalized.startsWith(`${moduleName}/`))) {
        violations.add(`${moduleKey(entry)} -> ${specifier} (via ${moduleKey(current)})`)
        continue
      }
      const resolved = await resolveLocalImport(current, specifier)
      if (resolved) {
        const resolvedKey = moduleKey(resolved)
        if ([...protectedModules].some((moduleName) => resolvedKey === moduleName || resolvedKey.startsWith(`${moduleName}/`))) {
          violations.add(`${moduleKey(entry)} -> ${specifier} (via ${moduleKey(current)})`)
          continue
        }
        pending.push(resolved)
      }
    }
  }
}

for (const directory of scanRoots) await walk(path.join(root, directory))
for (const entry of clientEntries) await scanClientGraph(entry)

if (violations.size) {
  console.error("Client/server content boundary violations (including transitive imports):\n" + [...violations].join("\n"))
  process.exitCode = 1
} else {
  console.log(`Client/server content boundary: OK (${clientEntries.length} client entry points scanned transitively)`)
}
