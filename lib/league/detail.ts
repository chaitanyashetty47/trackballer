import { cache } from "react"

import { createClient } from "@/lib/supabase/server"

export type LeagueDetail = {
  id: number
  name: string
  slug: string
  country: string | null
  isActive: boolean
  logoUrl: string | null
}

export const getLeagueBySlug = cache(async (slug: string): Promise<LeagueDetail | null> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("leagues")
    .select("id, name, slug, country, is_active, logo_url")
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    console.error("getLeagueBySlug failed:", error.message)
    return null
  }

  if (!data) return null

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    country: data.country,
    isActive: data.is_active,
    logoUrl: data.logo_url,
  }
})
