"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "nextjs-toploader/app"

import { OptionMenuSelect } from "@/components/ui/option-menu-select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FixtureView } from "@/lib/catalog/types"
import { buildWorldCupHref } from "@/lib/world-cup/navigation"
import { buildRoundMenuGroups } from "@/lib/world-cup/round-groups"
import { cn } from "@/lib/utils"

type WorldCupRoundNavProps = {
  rounds: { name: string }[]
  activeRound: string
  view: FixtureView
}

const VIEW_TABS: { value: FixtureView; label: string }[] = [
  { value: "finished", label: "Finished" },
  { value: "upcoming", label: "Upcoming" },
]

const arrowClass =
  "flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted/60 disabled:pointer-events-none disabled:opacity-40 md:size-7"

const panelWidthClass = "w-full"

export function WorldCupRoundNav({
  rounds,
  activeRound,
  view,
}: WorldCupRoundNavProps) {
  const router = useRouter()

  const activeIndex = rounds.findIndex((r) => r.name === activeRound)
  const prevRound = activeIndex > 0 ? rounds[activeIndex - 1] : null
  const nextRound =
    activeIndex >= 0 && activeIndex < rounds.length - 1
      ? rounds[activeIndex + 1]
      : null

  const menuGroups = buildRoundMenuGroups(rounds)

  function goToRound(round: string) {
    router.push(buildWorldCupHref(round, view))
  }

  function goToView(nextView: FixtureView) {
    if (nextView === view) return
    router.push(buildWorldCupHref(activeRound, nextView))
  }

  return (
    <div className={cn("space-y-3", panelWidthClass)}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={arrowClass}
          onClick={() => prevRound && goToRound(prevRound.name)}
          disabled={!prevRound}
          aria-label="Previous round"
        >
          <ChevronLeft className="size-4" />
        </button>

        <OptionMenuSelect
          value={activeRound}
          onValueChange={goToRound}
          groups={menuGroups}
          ariaLabel="Select World Cup round"
          triggerClassName="h-8 flex-1 text-xs md:text-[0.7rem]"
        />

        <button
          type="button"
          className={arrowClass}
          onClick={() => nextRound && goToRound(nextRound.name)}
          disabled={!nextRound}
          aria-label="Next round"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <Tabs
        value={view}
        onValueChange={(nextView) => goToView(nextView as FixtureView)}
        className="w-full"
      >
        <TabsList className="h-8 w-full">
          {VIEW_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex-1 text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
