import { CatalogImage } from "@/components/catalog-image"
import { cn } from "@/lib/utils"

type MatchEventBadgeProps = {
  iconSrc: string
  label: string
  count: number
  side: "left" | "right"
  /** Pitch corners: icon stays put; 2+ count grows away from the face. */
  layout?: "default" | "corner"
  className?: string
}

function EventBadgePill({
  iconSrc,
  label,
  count,
  expandFrom,
}: {
  iconSrc: string
  label: string
  count: number
  expandFrom?: "left" | "right"
}) {
  const showCount = count >= 2

  return (
    <span
      className={cn(
        "flex items-center rounded-full border border-border bg-card shadow-sm",
        showCount ? "gap-0.5 py-0.5 pl-0.5 pr-1" : "size-5 justify-center",
        expandFrom === "left" && showCount && "flex-row-reverse pl-1 pr-0.5",
      )}
      aria-label={`${count} ${label}${count === 1 ? "" : "s"}`}
    >
      <span className="flex size-4 shrink-0 items-center justify-center">
        <CatalogImage
          src={iconSrc}
          alt=""
          width={12}
          height={12}
          className="object-contain dark:invert"
        />
      </span>
      {showCount && (
        <span className="pr-0.5 font-mono text-[9px] font-bold leading-none tabular-nums text-foreground">
          {count}
        </span>
      )}
    </span>
  )
}

/** Goal or assist marker beside a player avatar (icon + count in one pill when 2+). */
export function MatchEventBadge({
  iconSrc,
  label,
  count,
  side,
  layout = "default",
  className,
}: MatchEventBadgeProps) {
  if (count < 1) return null

  const cornerPosition =
    layout === "corner"
      ? side === "right"
        ? "bottom-auto top-0.5 left-[calc(100%-6px)]"
        : "bottom-auto top-0.5 right-[calc(100%-6px)]"
      : null

  return (
    <span
      className={cn(
        "pointer-events-none absolute z-20",
        cornerPosition ??
          cn("bottom-0", side === "left" ? "-left-1" : "-right-1"),
        className,
      )}
    >
      <EventBadgePill
        iconSrc={iconSrc}
        label={label}
        count={count}
        expandFrom={layout === "corner" ? side : undefined}
      />
    </span>
  )
}

const GOAL_ICON = "/football-svgrepo-com.svg"
const ASSIST_ICON = "/american-football-black-shoe-svgrepo-com.svg"

/** Inline goal then assist, for bench/sub rows (left of sub-on minute). */
export function MatchContributionBadgesInline({
  goalCount,
  assistCount,
}: {
  goalCount: number
  assistCount: number
}) {
  if (goalCount < 1 && assistCount < 1) return null

  return (
    <span className="flex shrink-0 items-center gap-1">
      {goalCount > 0 && (
        <EventBadgePill iconSrc={GOAL_ICON} label="goal" count={goalCount} />
      )}
      {assistCount > 0 && (
        <EventBadgePill iconSrc={ASSIST_ICON} label="assist" count={assistCount} />
      )}
    </span>
  )
}
