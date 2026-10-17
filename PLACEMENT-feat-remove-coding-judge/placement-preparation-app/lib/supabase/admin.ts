// SERVER-ONLY — never import this in client components or "use client" files.
// The service role key bypasses RLS; only use it in server actions / route handlers.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Singleton: one admin client per server process.
// The <any,any,any> generics are intentional — the admin client bypasses RLS
// and works against raw table columns, so generated DB types are not needed.
let _admin: SupabaseClient<any, any, any> | null = null

export function createAdminClient(): SupabaseClient<any, any, any> {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )
  }
  return _admin
}
