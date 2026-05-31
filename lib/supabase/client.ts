import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"
import { getSupabasePublishableConfig } from "@/lib/supabase/env"

/** Supabase client for browser-only UI (sign-in buttons, forms). */
export function createClient() {
  const { url, key } = getSupabasePublishableConfig()
  return createBrowserClient<Database>(url, key)
}
