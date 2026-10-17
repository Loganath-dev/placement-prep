import { NextResponse } from "next/server"
import { readEntitlement } from "@/lib/premium-guard"

/**
 * Authoritative entitlement for the signed-in user. The client store reconciles
 * its `premium` flag from user_state on hydrate already; this endpoint exposes
 * the same source of truth for defense-in-depth checks and for any server or
 * client code that needs a fresh, trustworthy answer without a full state load.
 */
export async function GET() {
  const ent = await readEntitlement()
  if (!ent) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }
  return NextResponse.json({
    premium: ent.premium,
    premiumUntil: ent.premiumUntil,
    source: ent.source,
  })
}
