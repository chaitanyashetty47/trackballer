import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

/** Cached fixture count — proves publishable-key reads work under RLS. */
export const getFixtureCount = cache(async (): Promise<number | null> => {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("fixtures")
    .select("*", { count: "exact", head: true })

  if (error) {
    console.error("fixtures count failed:", error.message)
    return null
  }

  return count
})
