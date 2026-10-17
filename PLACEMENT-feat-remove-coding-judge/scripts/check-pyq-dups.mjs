import fs from "node:fs"

const src = fs.readFileSync(new URL("../lib/data/pyqs.ts", import.meta.url), "utf8")

// Match each hand-authored p(...) call and capture the prompt (7th argument).
const re = /p\(\s*"(\w+)",\s*"[\w-]+",\s*"[^"]+",\s*\d+,\s*(?:true|false),\s*"(easy|medium|hard)",\s*"((?:[^"\\]|\\.)*)"/g

const entries = []
let m
while ((m = re.exec(src)) !== null) {
  entries.push({ company: m[1], difficulty: m[2], prompt: m[3].toLowerCase().trim() })
}

console.log("Total hand-authored PYQs:", entries.length)

const byDifficulty = {}
for (const e of entries) byDifficulty[e.difficulty] = (byDifficulty[e.difficulty] || 0) + 1
console.log("Difficulty mix:", byDifficulty)

const byCompany = {}
for (const e of entries) byCompany[e.company] = (byCompany[e.company] || 0) + 1
console.log("Per company:", byCompany)

const seen = new Map()
for (const e of entries) seen.set(e.prompt, (seen.get(e.prompt) || 0) + 1)
const dups = [...seen].filter(([, c]) => c > 1)
console.log("Exact duplicate prompts:", dups.length)
for (const [p, c] of dups) console.log("  -", `(x${c})`, p.slice(0, 110))
