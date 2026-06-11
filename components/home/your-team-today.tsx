import Link from "next/link"

import { TeamFlag } from "@/components/team-flag"

import { formatYourTeamKickoff } from "@/lib/home/your-team-today"
import type { YourTeamTodayItem } from "@/lib/home/types"

type YourTeamTodayProps = {
  items: YourTeamTodayItem[]
}

export function YourTeamToday({ items }: YourTeamTodayProps) {
  if (items.length === 0) return null

  return (
    <section className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <h2 className="mb-3 text-sm font-semibold">Your teams today</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={`${item.fixtureId}-${item.teamName}`}>
            <Link
              href={`/match/${item.fixtureId}`}
              className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-primary/10"
            >
              {item.teamLogoUrl ? (
                <TeamFlag
                  team={{
                    name: item.teamName,
                    logo_url: item.teamLogoUrl,
                    code: item.teamName.slice(0, 3),
                  }}
                  size="md"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {item.teamName} {item.isHome ? "vs" : "at"} {item.opponentName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatYourTeamKickoff(item.kickoffAt)}
                  {item.roundName ? ` · ${item.roundName}` : ""}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
