import { cache } from "react"

import type { CompetitionStrip, CompetitionStripItem } from "@/lib/home/types"
import { createClient } from "@/lib/supabase/server"

const T5_SLUG_ORDER = [
  "premier-league",
  "la-liga",
  "serie-a",
  "bundesliga",
  "ligue-1",
] as const

const SHORT_LABELS: Record<string, string> = {
  "world-cup": "WC",
  "premier-league": "PL",
  "la-liga": "LL",
  "serie-a": "SA",
  bundesliga: "BL",
  "ligue-1": "L1",
}

type LeagueRow = {
  id: number
  name: string
  slug: string
  is_active: boolean
  logo_url: string | null
}

function shortLabel(slug: string): string {
  return SHORT_LABELS[slug] ?? slug.slice(0, 2).toUpperCase()
}

function mapStripItem(row: LeagueRow, featured: boolean): CompetitionStripItem {
  const href = row.slug === "world-cup" ? "/world-cup" : `/league/${row.slug}`
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortLabel: shortLabel(row.slug),
    href,
    isFeatured: featured,
    logoUrl: row.logo_url,
  }
}

export const getCompetitionStrip = cache(async (): Promise<CompetitionStrip> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("leagues")
    .select("id, name, slug, is_active, logo_url")
    .in("slug", ["world-cup", ...T5_SLUG_ORDER])

  if (error) {
    console.error("getCompetitionStrip failed:", error.message)
    return fallbackStrip()
  }

  const bySlug = new Map((data ?? []).map((row) => [row.slug, row as LeagueRow]))
  const wcRow = bySlug.get("world-cup")

  const featured = wcRow
    ? mapStripItem(wcRow, true)
    : {
        id: 1,
        name: "FIFA World Cup",
        slug: "world-cup",
        shortLabel: "WC",
        href: "/world-cup",
        isFeatured: true,
        logoUrl: null,
      }

  const others = T5_SLUG_ORDER.map((slug) => bySlug.get(slug))
    .filter((row): row is LeagueRow => row != null)
    .map((row) => mapStripItem(row, false))

  return { featured, others }
})

function fallbackStrip(): CompetitionStrip {
  return {
    featured: {
      id: 1,
      name: "FIFA World Cup",
      slug: "world-cup",
      shortLabel: "WC",
      href: "/world-cup",
      isFeatured: true,
      logoUrl: null,
    },
    others: T5_SLUG_ORDER.map((slug, index) => ({
      id: index + 2,
      name: slug,
      slug,
      shortLabel: shortLabel(slug),
      href: `/league/${slug}`,
      isFeatured: false,
      logoUrl: null,
    })),
  }
}
