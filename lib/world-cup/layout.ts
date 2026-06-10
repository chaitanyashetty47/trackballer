/** Narrower column for trending players beside fixtures. */
export const WC_TRENDING_WIDTH = "15.5rem"

/** Standings column (17rem base + ~23% for readable table). */
export const WC_STANDINGS_WIDTH = "21rem"

/** Fixtures + sidebar (trending + standings + gap). */
export const WC_SIDEBAR_TOTAL_WIDTH = "37.5rem"

export const wcHubContentGridClass =
  "grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,37.5rem)] lg:items-start"

export const wcHubFixturesAreaClass =
  "order-4 min-w-0 lg:order-none lg:col-start-1 lg:row-start-1"

export const wcHubSidebarAreaClass =
  "order-1 min-w-0 lg:order-none lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:self-start"

/** Row 1: leaders + standings; row 2: comments spans both columns. */
export const wcHubSidebarInnerGridClass =
  "flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,15.5rem)_minmax(0,21rem)] lg:gap-4"

export const wcHubLeadersAreaClass = "order-1 lg:col-start-1 lg:row-start-1"

export const wcHubCommentsAreaClass = "order-2 lg:col-span-2 lg:row-start-2"

export const wcHubStandingsAreaClass = "order-3 lg:col-start-2 lg:row-start-1"

/** Sidebar card shell — height follows content, no forced min-height. */
export const wcSidebarCardClass =
  "overflow-hidden rounded-lg border border-border bg-card"

export const wcSidebarTitleClass = "text-sm font-semibold leading-tight"

export const wcSidebarSubtitleClass =
  "mt-0.5 text-[10px] leading-snug text-muted-foreground"
