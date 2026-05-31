import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"
import { getSupabasePublishableConfig } from "@/lib/supabase/env"

/** Supabase client for server pages and route handlers (cookie session). */
export async function createClient() {
  const { url, key } = getSupabasePublishableConfig()
  const cookieStore = await cookies()

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Read-only server page — session refresh happens in middleware later.
        }
      },
    },
  })
}
