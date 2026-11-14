import { existsSync } from "node:fs"
import { resolve } from "node:path"

const root = process.cwd()
const appDirectory = resolve(root, "app")
const page = resolve(appDirectory, "page.tsx")
const apiDirectory = resolve(appDirectory, "api")
const legacyDirectory = resolve(root, "components", "app")

const errors = []

if (!existsSync(appDirectory)) {
  errors.push("Missing root-level app/ directory required by the Next.js App Router.")
}
if (!existsSync(page)) {
  errors.push("Missing app/page.tsx root route.")
}
if (!existsSync(apiDirectory)) {
  errors.push("Missing app/api/ route directory.")
}
if (existsSync(legacyDirectory)) {
  errors.push("Legacy components/app/ routing directory detected; move routes to root app/.")
}

if (errors.length) {
  console.error("Next.js App Router directory check failed:\n" + errors.map((item) => `- ${item}`).join("\n"))
  process.exit(1)
}

console.log("Next.js App Router directory: OK")
