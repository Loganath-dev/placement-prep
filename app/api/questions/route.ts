import { NextResponse } from "next/server"
import { readEntitlement } from "@/lib/premium-guard"
import { createAdminClient } from "@/lib/supabase/admin"
import { COMPANY_BY_ID } from "@/lib/data/companies"
import { SECTION_META } from "@/lib/data/content"

/**
 * Which content tiers a viewer may receive. This is the gate: a non-premium
 * viewer can only ever be served `free` rows, so premium content is never sent
 * to a free client and never ships in the JS bundle.
 */
export function tiersFor(premium: boolean): ("free" | "premium")[] {
  return premium ? ["free", "premium"] : ["free"]
}

/**
 * Serve live questions from the content datastore, gated by entitlement.
 * Uses the service role (to read premium rows) but filters tiers explicitly in
 * code from `readEntitlement()`, so the server — not the browser — decides what
 * a viewer receives.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const section = url.searchParams.get("section")
  const company = url.searchParams.get("company")
  const requestedLimit = Number(url.searchParams.get("limit") ?? 20)
  const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 20
  const requestedOffset = Number(url.searchParams.get("offset") ?? 0)
  const offset = Number.isInteger(requestedOffset) ? Math.max(0, Math.min(requestedOffset, 10_000)) : 0

  if (section && !SECTION_META.some((item) => item.id === section)) {
    return NextResponse.json({ error: "Unknown question section." }, { status: 400 })
  }
  if (company && company !== "general" && !COMPANY_BY_ID[company as keyof typeof COMPANY_BY_ID]) {
    return NextResponse.json({ error: "Unknown company track." }, { status: 400 })
  }

  const ent = await readEntitlement()
  const premium = ent?.premium ?? false
  const tiers = tiersFor(premium)

  const admin = createAdminClient()
  let query = admin
    .from("content_questions")
    .select(
      "id, section, company_id, topic, difficulty, prompt, options, answer, explanation, option_notes, curated, tier",
    )
    .eq("status", "live")
    .in("tier", tiers)
    .order("id", { ascending: true })
    .range(offset, offset + limit - 1)
  if (section) query = query.eq("section", section)
  // A company track gets its own company-specific questions plus the
  // company-agnostic (general) ones. Omitting `company` returns everything.
  if (company === "general") {
    query = query.is("company_id", null)
  } else if (company) {
    query = query.or(`company_id.eq.${company},company_id.is.null`)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: "Could not load questions." }, { status: 500 })
  }

  return NextResponse.json({ premium, tiers, offset, limit, questions: data ?? [] }, { headers: { "Cache-Control": "private, no-store" } })
}
